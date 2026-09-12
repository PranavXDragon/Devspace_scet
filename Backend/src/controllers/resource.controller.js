import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get all resources (Admin view - includes drafts)
export const getAllResources = asyncHandler(async (req, res) => {
    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw new ApiError(500, "Failed to fetch resources");
    }

    return res.status(200).json(
        new ApiResponse(200, data, "Resources fetched successfully")
    );
});

// Get published resources (Student view)
export const getPublishedResources = asyncHandler(async (req, res) => {
    // Add pagination or filtering here later if needed
    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('status', 'Published')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Supabase Error in getPublishedResources:", error);
        throw new ApiError(500, "Failed to fetch published resources");
    }

    return res.status(200).json(
        new ApiResponse(200, data, "Published resources fetched successfully")
    );
});

// Get single resource
export const getResourceById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: resource, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !resource) {
        throw new ApiError(404, "Resource not found");
    }

    return res.status(200).json(
        new ApiResponse(200, resource, "Resource fetched successfully")
    );
});

// Create a new resource
export const createResource = asyncHandler(async (req, res) => {
    const { 
        title, 
        description, 
        category, 
        topic, 
        type, 
        url,
        difficulty, 
        tags, 
        thumbnail_url,
        author,
        is_featured,
        status
    } = req.body;

    if (!title || !description || !category || !topic || !type || !url) {
        throw new ApiError(400, "Missing required fields");
    }

    const { data: resource, error } = await supabase
        .from('resources')
        .insert([{ 
            title, 
            description, 
            category, 
            topic, 
            type, 
            url,
            difficulty: difficulty || 'Beginner',
            tags: tags || [], 
            thumbnail_url,
            author,
            is_featured: is_featured || false,
            status: status || 'Draft'
        }])
        .select()
        .single();

    if (error) {
        throw new ApiError(500, "Failed to create resource: " + error.message);
    }

    return res.status(201).json(
        new ApiResponse(201, resource, "Resource created successfully")
    );
});

// Update a resource
export const updateResource = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const { data: resource, error } = await supabase
        .from('resources')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new ApiError(500, "Failed to update resource: " + error.message);
    }

    return res.status(200).json(
        new ApiResponse(200, resource, "Resource updated successfully")
    );
});

// Delete a resource
export const deleteResource = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

    if (error) {
        throw new ApiError(500, "Failed to delete resource");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Resource deleted successfully")
    );
});
