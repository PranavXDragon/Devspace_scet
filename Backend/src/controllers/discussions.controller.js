import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ---- DISCUSSIONS ----

export const getDiscussions = asyncHandler(async (req, res) => {
    const { data: discussions, error } = await supabase
        .from('discussions')
        .select(`
            *,
            student_registrations ( name, avatar_url ),
            discussion_replies ( id )
        `)
        .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, "Failed to fetch discussions");
    return res.status(200).json(new ApiResponse(200, discussions, "Discussions fetched"));
});

export const getDiscussionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const { data: discussion, error } = await supabase
        .from('discussions')
        .select(`
            *,
            student_registrations ( name, avatar_url ),
            discussion_replies ( 
                *,
                student_registrations ( name, avatar_url )
            )
        `)
        .eq('id', id)
        .single();

    if (error) throw new ApiError(404, "Discussion not found");
    
    // Sort replies by created_at or upvotes
    discussion.discussion_replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return res.status(200).json(new ApiResponse(200, discussion, "Discussion fetched"));
});

export const createDiscussion = asyncHandler(async (req, res) => {
    const { title, content, tags, student_id } = req.body;

    if (!title || !content || !student_id) {
        throw new ApiError(400, "Title, content, and student_id are required");
    }

    const { data, error } = await supabase
        .from('discussions')
        .insert([{ title, content, tags, student_id }])
        .select()
        .single();

    if (error) throw new ApiError(500, "Failed to create discussion");
    return res.status(201).json(new ApiResponse(201, data, "Discussion created"));
});

export const updateDiscussion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content, tags, student_id } = req.body;

    // Verify ownership
    const { data: discussion } = await supabase.from('discussions').select('student_id').eq('id', id).single();
    if (!discussion || discussion.student_id !== student_id) {
        throw new ApiError(403, "Not authorized to update this discussion");
    }

    const { data, error } = await supabase
        .from('discussions')
        .update({ title, content, tags, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new ApiError(500, "Failed to update discussion");
    return res.status(200).json(new ApiResponse(200, data, "Discussion updated"));
});

export const deleteDiscussion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { student_id } = req.body; // In a real app, from auth token

    const { data: discussion } = await supabase.from('discussions').select('student_id').eq('id', id).single();
    if (!discussion || discussion.student_id !== student_id) {
        throw new ApiError(403, "Not authorized to delete this discussion");
    }

    const { error } = await supabase.from('discussions').delete().eq('id', id);
    if (error) throw new ApiError(500, "Failed to delete discussion");

    return res.status(200).json(new ApiResponse(200, {}, "Discussion deleted"));
});

// ---- REPLIES ----

export const createReply = asyncHandler(async (req, res) => {
    const { id: discussion_id } = req.params;
    const { content, student_id } = req.body;

    if (!content || !student_id) {
        throw new ApiError(400, "Content and student_id required");
    }

    const { data, error } = await supabase
        .from('discussion_replies')
        .insert([{ discussion_id, content, student_id }])
        .select()
        .single();

    if (error) throw new ApiError(500, "Failed to post reply");
    return res.status(201).json(new ApiResponse(201, data, "Reply posted"));
});

export const updateReply = asyncHandler(async (req, res) => {
    const { replyId } = req.params;
    const { content, student_id } = req.body;

    const { data: reply } = await supabase.from('discussion_replies').select('student_id').eq('id', replyId).single();
    if (!reply || reply.student_id !== student_id) {
        throw new ApiError(403, "Not authorized");
    }

    const { data, error } = await supabase
        .from('discussion_replies')
        .update({ content, updated_at: new Date() })
        .eq('id', replyId)
        .select()
        .single();

    if (error) throw new ApiError(500, "Failed to update reply");
    return res.status(200).json(new ApiResponse(200, data, "Reply updated"));
});

export const deleteReply = asyncHandler(async (req, res) => {
    const { replyId } = req.params;
    const { student_id } = req.body;

    const { data: reply } = await supabase.from('discussion_replies').select('student_id').eq('id', replyId).single();
    if (!reply || reply.student_id !== student_id) {
        throw new ApiError(403, "Not authorized");
    }

    const { error } = await supabase.from('discussion_replies').delete().eq('id', replyId);
    if (error) throw new ApiError(500, "Failed to delete reply");
    
    return res.status(200).json(new ApiResponse(200, {}, "Reply deleted"));
});
