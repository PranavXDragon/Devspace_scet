import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAnalytics = asyncHandler(async (req, res) => {
    const { student_id } = req.query;
    if (!student_id) throw new ApiError(400, "student_id is required");

    // Fetch problems solved
    const { data: solvedProblems } = await supabase
        .from('problem_submissions')
        .select('id, score, created_at')
        .eq('student_id', student_id)
        .eq('status', 'Accepted');

    // Group by month for chart data
    const chartDataMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
        let m = d.getMonth() - i;
        if (m < 0) m += 12;
        chartDataMap[months[m]] = { name: months[m], problems: 0 };
    }

    let totalPoints = 0;
    if (solvedProblems) {
        solvedProblems.forEach(sp => {
            totalPoints += (sp.score || 10); // arbitrary points calculation for MVP
            const monthStr = months[new Date(sp.created_at).getMonth()];
            if (chartDataMap[monthStr]) {
                chartDataMap[monthStr].problems += 1;
            }
        });
    }

    const chartData = Object.values(chartDataMap);

    const data = {
        total_problems_solved: solvedProblems?.length || 0,
        total_points: totalPoints,
        chart_data: chartData
    };

    return res.status(200).json(new ApiResponse(200, data, "Analytics fetched"));
});

export const getAchievements = asyncHandler(async (req, res) => {
    const { student_id } = req.query;
    if (!student_id) throw new ApiError(400, "student_id is required");

    // Fetch all achievements
    const { data: allAchievements, error } = await supabase.from('achievements').select('*').order('required_points', { ascending: true });
    if (error) throw new ApiError(500, "Failed to fetch achievements");

    // Fetch earned achievements
    const { data: earned } = await supabase
        .from('student_achievements')
        .select('achievement_id, earned_at')
        .eq('student_id', student_id);
    
    const earnedMap = {};
    if (earned) {
        earned.forEach(e => { earnedMap[e.achievement_id] = e.earned_at; });
    }

    // Determine total points for calculating which ones to award dynamically for MVP
    // Usually this would be done by a trigger or cron.
    const { data: solved } = await supabase.from('problem_submissions').select('score').eq('student_id', student_id).eq('status', 'Accepted');
    let points = 0;
    if (solved) {
        points = solved.reduce((acc, curr) => acc + (curr.score || 10), 0);
    }

    const responseData = allAchievements.map(ach => {
        let isEarned = !!earnedMap[ach.id];
        
        // MVP dynamic award logic if they have the points but it's not saved yet
        if (!isEarned && points >= ach.required_points) {
            // Save it asynchronously
            supabase.from('student_achievements').insert([{ student_id, achievement_id: ach.id }]).then();
            isEarned = true;
        }

        return {
            ...ach,
            is_earned: isEarned,
            earned_at: earnedMap[ach.id] || (isEarned ? new Date() : null)
        };
    });

    return res.status(200).json(new ApiResponse(200, {
        current_points: points,
        achievements: responseData
    }, "Achievements fetched"));
});
