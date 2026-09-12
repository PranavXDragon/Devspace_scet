import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createTeam = asyncHandler(async (req, res) => {
    const { name, description, avatar_url, student_id } = req.body;

    if (!student_id || !name) {
        throw new ApiError(400, "Student ID and Team Name are required");
    }

    // Check if student is already in a team
    const { data: existingMember } = await supabase
        .from('team_members')
        .select('*')
        .eq('student_id', student_id)
        .maybeSingle();

    if (existingMember) {
        throw new ApiError(400, "You are already in a team.");
    }

    // Create team
    const { data: team, error } = await supabase
        .from('teams')
        .insert([{ name, description, avatar_url, created_by: student_id }])
        .select()
        .single();

    if (error) throw new ApiError(500, "Failed to create team: " + error.message);

    // Add creator as Leader
    await supabase.from('team_members').insert([{
        team_id: team.id,
        student_id: student_id,
        role: 'Leader'
    }]);

    return res.status(201).json(new ApiResponse(201, team, "Team created successfully"));
});

export const getMyTeam = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const { data: member } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('student_id', studentId)
        .maybeSingle();

    if (!member) {
        return res.status(200).json(new ApiResponse(200, null, "Not in a team"));
    }

    const { data: team, error } = await supabase
        .from('teams')
        .select(`
            *,
            team_members (
                role,
                joined_at,
                student_registrations ( id, name, github_username )
            )
        `)
        .eq('id', member.team_id)
        .single();

    if (error) throw new ApiError(500, "Failed to fetch team details");

    return res.status(200).json(new ApiResponse(200, team, "Team details fetched"));
});

export const joinTeam = asyncHandler(async (req, res) => {
    const { id } = req.params; // team id
    const { student_id } = req.body;

    // Check if student already in team
    const { data: existingMember } = await supabase
        .from('team_members')
        .select('*')
        .eq('student_id', student_id)
        .maybeSingle();

    if (existingMember) {
        throw new ApiError(400, "You are already in a team.");
    }

    // Check team size (limit 4)
    const { data: members } = await supabase
        .from('team_members')
        .select('student_id', { count: 'exact' })
        .eq('team_id', id);

    if (members && members.length >= 4) {
        throw new ApiError(400, "Team is already full (max 4 members).");
    }

    const { error } = await supabase.from('team_members').insert([{
        team_id: id,
        student_id: student_id,
        role: 'Member'
    }]);

    if (error) throw new ApiError(500, "Failed to join team: " + error.message);

    return res.status(200).json(new ApiResponse(200, {}, "Successfully joined team"));
});

export const getAllTeams = asyncHandler(async (req, res) => {
    const { data: teams, error } = await supabase
        .from('teams')
        .select(`
            *,
            team_members ( student_id )
        `)
        .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, "Failed to fetch teams");

    return res.status(200).json(new ApiResponse(200, teams, "Teams fetched successfully"));
});
