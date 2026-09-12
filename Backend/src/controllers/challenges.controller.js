import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getActiveChallenges = asyncHandler(async (req, res) => {
    // Get daily or active challenges
    const now = new Date().toISOString();
    
    const { data: challenges, error } = await supabase
        .from('challenges')
        .select(`
            *,
            coding_problems ( title, difficulty )
        `)
        .lte('start_time', now)
        .gte('end_time', now)
        .order('end_time', { ascending: true });

    if (error) throw new ApiError(500, "Failed to fetch active challenges: " + error.message);

    return res.status(200).json(new ApiResponse(200, challenges, "Active challenges fetched successfully"));
});

export const getChallengeDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const { data: challenge, error } = await supabase
        .from('challenges')
        .select(`
            *,
            coding_problems ( title, difficulty, description, starter_code )
        `)
        .eq('id', id)
        .single();

    if (error || !challenge) throw new ApiError(404, "Challenge not found");

    return res.status(200).json(new ApiResponse(200, challenge, "Challenge details fetched successfully"));
});

export const submitChallenge = asyncHandler(async (req, res) => {
    // This would typically involve validating against test cases.
    // For MVP gamification, we'll assume the student solved it successfully if they call this endpoint with 'Accepted' status.
    // In reality, this endpoint should call the piston/judge0 executor.
    
    const { id } = req.params;
    const { studentId, status } = req.body; // status e.g., 'Accepted'

    if (!studentId) throw new ApiError(400, "studentId is required");
    
    // Validate challenge exists and is active
    const now = new Date().toISOString();
    const { data: challenge, error: challengeErr } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .lte('start_time', now)
        .gte('end_time', now)
        .single();
        
    if (challengeErr || !challenge) {
        throw new ApiError(404, "Challenge not found or not currently active");
    }

    if (status === 'Accepted') {
        // Check if already completed
        const { data: existingCompletion } = await supabase
            .from('challenge_completions')
            .select('id')
            .eq('student_id', studentId)
            .eq('challenge_id', id)
            .maybeSingle();
            
        if (existingCompletion) {
            return res.status(200).json(new ApiResponse(200, { pointsAwarded: 0 }, "Challenge already completed"));
        }

        // Award points
        const { error: completionErr } = await supabase
            .from('challenge_completions')
            .insert([{
                student_id: studentId,
                challenge_id: id,
                points_awarded: challenge.reward_points
            }]);
            
        if (completionErr) throw new ApiError(500, "Failed to record completion: " + completionErr.message);

        // Update student stats
        const { data: stats, error: statsCheckErr } = await supabase
            .from('student_stats')
            .select('*')
            .eq('student_id', studentId)
            .maybeSingle();

        if (statsCheckErr) throw new ApiError(500, "Error checking stats");

        if (!stats) {
            // Create new stats row
            await supabase.from('student_stats').insert([{
                student_id: studentId,
                total_points: challenge.reward_points,
                current_streak: 1,
                max_streak: 1,
                last_submission_date: new Date().toISOString()
            }]);
        } else {
            // Update existing
            const lastSubDate = stats.last_submission_date ? new Date(stats.last_submission_date) : null;
            const today = new Date();
            let newStreak = stats.current_streak;
            
            if (lastSubDate) {
                const diffTime = Math.abs(today - lastSubDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    newStreak += 1;
                } else if (diffDays > 1) {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }

            await supabase
                .from('student_stats')
                .update({
                    total_points: stats.total_points + challenge.reward_points,
                    current_streak: newStreak,
                    max_streak: Math.max(stats.max_streak, newStreak),
                    last_submission_date: today.toISOString()
                })
                .eq('student_id', studentId);
        }

        return res.status(200).json(new ApiResponse(200, { pointsAwarded: challenge.reward_points }, "Challenge solved and points awarded!"));
    }
    
    return res.status(200).json(new ApiResponse(200, { pointsAwarded: 0 }, "Submission recorded, but not accepted."));
});
