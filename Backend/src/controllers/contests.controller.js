import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getContests = asyncHandler(async (req, res) => {
    const { data: contests, error } = await supabase
        .from('contests')
        .select('*')
        .order('start_time', { ascending: false });

    if (error) throw new ApiError(500, "Failed to fetch contests: " + error.message);

    return res.status(200).json(new ApiResponse(200, contests, "Contests fetched successfully"));
});

export const getContestDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Fetch contest and its problems
    const { data: contest, error } = await supabase
        .from('contests')
        .select(`
            *,
            contest_problems (
                score,
                coding_problems ( id, title, difficulty )
            )
        `)
        .eq('id', id)
        .single();

    if (error || !contest) throw new ApiError(404, "Contest not found");

    return res.status(200).json(new ApiResponse(200, contest, "Contest details fetched successfully"));
});
