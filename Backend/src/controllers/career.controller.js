import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getOpportunities = asyncHandler(async (req, res) => {
    const { data: opportunities, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, "Failed to fetch opportunities");
    
    return res.status(200).json(new ApiResponse(200, opportunities, "Opportunities fetched"));
});

export const createOpportunity = asyncHandler(async (req, res) => {
    const { title, company, type, location, apply_url, deadline } = req.body;

    if (!title || !company || !apply_url) {
        throw new ApiError(400, "Title, company, and apply_url are required");
    }

    const { data, error } = await supabase
        .from('opportunities')
        .insert([{ title, company, type, location, apply_url, deadline }])
        .select()
        .single();

    if (error) throw new ApiError(500, "Failed to create opportunity");
    
    return res.status(201).json(new ApiResponse(201, data, "Opportunity created"));
});
