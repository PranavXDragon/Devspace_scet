import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPublicProjects = asyncHandler(async (req, res) => {
    const { data: projects, error } = await supabase
        .from('projects')
        .select(`
            *,
            teams ( name, avatar_url ),
            student_registrations ( name, github_username )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, "Failed to fetch public projects");

    return res.status(200).json(new ApiResponse(200, projects, "Public projects fetched successfully"));
});

export const getMyProjects = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    // A student can have personal projects, or team projects if they are in a team.
    // First, find their team id
    const { data: member } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('student_id', studentId)
        .maybeSingle();

    let query = supabase
        .from('projects')
        .select(`
            *,
            teams ( name ),
            student_registrations ( name )
        `);
        
    if (member) {
        query = query.or(`student_id.eq.${studentId},team_id.eq.${member.team_id}`);
    } else {
        query = query.eq('student_id', studentId);
    }

    const { data: projects, error } = await query;

    if (error) throw new ApiError(500, "Failed to fetch my projects");

    return res.status(200).json(new ApiResponse(200, projects, "My projects fetched successfully"));
});

export const createProject = asyncHandler(async (req, res) => {
    const { title, description, team_id, student_id, github_url, live_url, tags, is_public } = req.body;

    if (!title || !student_id) {
        throw new ApiError(400, "Title and Student ID are required");
    }

    const { data: project, error } = await supabase
        .from('projects')
        .insert([{ title, description, team_id, student_id, github_url, live_url, tags, is_public }])
        .select()
        .single();

    if (error) throw new ApiError(500, "Failed to create project: " + error.message);

    return res.status(201).json(new ApiResponse(201, project, "Project created successfully"));
});

export const updateProjectVisibility = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { is_public } = req.body;

    const { data: project, error } = await supabase
        .from('projects')
        .update({ is_public })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new ApiError(500, "Failed to update visibility");
    
    return res.status(200).json(new ApiResponse(200, project, "Visibility updated"));
});
