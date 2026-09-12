import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getEvents = asyncHandler(async (req, res) => {
    // Optionally fetch if a student is RSVP'd if student_id is passed
    const { student_id } = req.query;

    let selectQuery = `*, event_rsvps ( count )`;
    if (student_id) {
        selectQuery = `*, event_rsvps ( student_id )`;
    }

    const { data: events, error } = await supabase
        .from('events')
        .select(selectQuery)
        .order('date_time', { ascending: true }); // upcoming first

    if (error) throw new ApiError(500, "Failed to fetch events");

    // Format RSVP status if student_id was provided
    if (student_id) {
        events.forEach(e => {
            e.is_rsvpd = e.event_rsvps.some(rsvp => rsvp.student_id === student_id);
            e.rsvp_count = e.event_rsvps.length;
            delete e.event_rsvps;
        });
    }

    return res.status(200).json(new ApiResponse(200, events, "Events fetched"));
});

export const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date_time, location, type, image_url } = req.body;
    
    if (!title || !date_time) {
        throw new ApiError(400, "Title and date_time are required");
    }

    const { data, error } = await supabase
        .from('events')
        .insert([{ title, description, date_time, location, type, image_url }])
        .select()
        .single();

    if (error) throw new ApiError(500, "Failed to create event");
    return res.status(201).json(new ApiResponse(201, data, "Event created"));
});

export const deleteEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw new ApiError(500, "Failed to delete event");
    
    return res.status(200).json(new ApiResponse(200, {}, "Event deleted"));
});

export const rsvpToEvent = asyncHandler(async (req, res) => {
    const { id: event_id } = req.params;
    const { student_id } = req.body;

    if (!student_id) throw new ApiError(400, "student_id is required");

    // Check if already RSVP'd
    const { data: existing } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', event_id)
        .eq('student_id', student_id)
        .maybeSingle();

    if (existing) {
        // Cancel RSVP
        await supabase.from('event_rsvps').delete().eq('event_id', event_id).eq('student_id', student_id);
        return res.status(200).json(new ApiResponse(200, { is_rsvpd: false }, "RSVP cancelled"));
    }

    // Add RSVP
    const { error } = await supabase.from('event_rsvps').insert([{ event_id, student_id }]);
    if (error) throw new ApiError(500, "Failed to RSVP");

    return res.status(200).json(new ApiResponse(200, { is_rsvpd: true }, "RSVP successful"));
});
