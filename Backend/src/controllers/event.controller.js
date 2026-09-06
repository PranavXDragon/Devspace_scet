import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary, deleteFromCloudinary, updateOnCloudinary, getPublicIdFromUrl } from '../utils/cloudinary.js';

const createEvent = asyncHandler(async (req, res) => {
  const { eventName, date, description, registrationLink } = req.body;

  if (!eventName || !date || !description) {
    throw new ApiError(400, 'Event name, date, and description are required');
  }

  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, 'Cover image is required');
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath, 'Devspace/event');

  if (!coverImage) {
    throw new ApiError(500, 'Error while uploading cover image');
  }

  const { data: event, error } = await supabase.from('events').insert([{
    eventName,
    date: new Date(date).toISOString(),
    description,
    registrationLink,
    coverImage: coverImage.url,
  }]).select().single();

  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.status(201).json(new ApiResponse(201, event, 'Event created successfully'));
});

const getEvents = asyncHandler(async (req, res) => {
  const { data: events, error } = await supabase.from('events').select('*').order('date', { ascending: false });

  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.status(200).json(new ApiResponse(200, events, 'Events fetched successfully'));
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: event, error: findError } = await supabase.from('events').select('*').eq('id', id).single();

  if (findError || !event) {
    throw new ApiError(404, 'Event not found');
  }

  // Extract public ID from Cloudinary URL
  const publicId = getPublicIdFromUrl(event.coverImage);
  await deleteFromCloudinary(publicId);

  const { error: deleteError } = await supabase.from('events').delete().eq('id', id);

  if (deleteError) {
    throw new ApiError(500, deleteError.message);
  }

  return res.status(200).json(new ApiResponse(200, {}, 'Event deleted successfully'));
});

const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { eventName, date, description, registrationLink } = req.body;

  const { data: event, error: findError } = await supabase.from('events').select('*').eq('id', id).single();

  if (findError || !event) {
    throw new ApiError(404, 'Event not found');
  }

  let newCoverImageUrl = event.coverImage;

  if (req.file) {
    const oldPublicId = getPublicIdFromUrl(event.coverImage);

    const uploadedImage = await updateOnCloudinary(req.file.path, oldPublicId);
    if (!uploadedImage) {
      throw new ApiError(500, 'Error while updating cover image');
    }
    newCoverImageUrl = uploadedImage.url;
  }

  const updates = {
    coverImage: newCoverImageUrl,
    updated_at: new Date().toISOString()
  };

  if (eventName) updates.eventName = eventName;
  if (date) updates.date = new Date(date).toISOString();
  if (description) updates.description = description;
  if (registrationLink !== undefined) updates.registrationLink = registrationLink;

  const { data: updatedEvent, error: updateError } = await supabase.from('events').update(updates).eq('id', id).select().single();

  if (updateError) {
    throw new ApiError(500, updateError.message);
  }

  return res.status(200).json(new ApiResponse(200, updatedEvent, 'Event updated successfully'));
});

export { createEvent, getEvents, deleteEvent, updateEvent };
