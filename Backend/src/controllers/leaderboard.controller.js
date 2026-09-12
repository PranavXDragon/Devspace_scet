import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getLeaderboard = asyncHandler(async (req, res) => {
    const { batch, course, limit = 50 } = req.query;
    
    let query = supabase
        .from('leaderboard_view')
        .select('*')
        .order('total_points', { ascending: false })
        .order('max_streak', { ascending: false })
        .limit(parseInt(limit));

    if (batch && batch !== 'ALL') {
        query = query.eq('batch', batch);
    }
    
    if (course && course !== 'ALL') {
        query = query.eq('course', course);
    }

    const { data: leaderboard, error } = await query;

    if (error) throw new ApiError(500, "Failed to fetch leaderboard: " + error.message);

    return res.status(200).json(new ApiResponse(200, leaderboard, "Leaderboard fetched successfully"));
});

export const getStudentRank = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    // A simpler way without window functions in SQL for MVP: fetch the whole board and find index.
    // In production with millions of rows, use a proper SQL rank function.
    const { data: allStats, error } = await supabase
        .from('leaderboard_view')
        .select('student_id, total_points, rank_tier')
        .order('total_points', { ascending: false });

    if (error) throw new ApiError(500, "Failed to fetch student rank");

    const rankIndex = allStats.findIndex(s => s.student_id === studentId);
    
    if (rankIndex === -1) {
        return res.status(200).json(new ApiResponse(200, { rank: null, total: allStats.length, points: 0, tier: 'Unranked' }, "Student not ranked yet"));
    }

    const myStats = allStats[rankIndex];

    return res.status(200).json(new ApiResponse(200, {
        rank: rankIndex + 1,
        total: allStats.length,
        points: myStats.total_points,
        tier: myStats.rank_tier
    }, "Rank fetched successfully"));
});
