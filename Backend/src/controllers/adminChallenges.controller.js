import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createChallenge = asyncHandler(async (req, res) => {
    const { title, description, start_time, end_time, problem_id, reward_points, type } = req.body;

    const { data: challenge, error } = await supabase
        .from('challenges')
        .insert([{ title, description, start_time, end_time, problem_id, reward_points, type }])
        .select()
        .single();

    if (error) throw new ApiError(500, "Failed to create challenge: " + error.message);
    return res.status(201).json(new ApiResponse(201, challenge, "Challenge created"));
});

export const updateChallenge = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const { data: challenge, error } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new ApiError(500, "Failed to update challenge: " + error.message);
    return res.status(200).json(new ApiResponse(200, challenge, "Challenge updated"));
});

export const deleteChallenge = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('challenges').delete().eq('id', id);
    if (error) throw new ApiError(500, "Failed to delete challenge");
    return res.status(200).json(new ApiResponse(200, {}, "Challenge deleted"));
});

// Contests
export const createContest = asyncHandler(async (req, res) => {
    const { title, description, start_time, end_time, duration_minutes } = req.body;

    const { data: contest, error } = await supabase
        .from('contests')
        .insert([{ title, description, start_time, end_time, duration_minutes }])
        .select()
        .single();

    if (error) throw new ApiError(500, "Failed to create contest: " + error.message);
    return res.status(201).json(new ApiResponse(201, contest, "Contest created"));
});

export const updateContest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const { data: contest, error } = await supabase
        .from('contests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new ApiError(500, "Failed to update contest: " + error.message);
    return res.status(200).json(new ApiResponse(200, contest, "Contest updated"));
});

export const deleteContest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('contests').delete().eq('id', id);
    if (error) throw new ApiError(500, "Failed to delete contest");
    return res.status(200).json(new ApiResponse(200, {}, "Contest deleted"));
});
