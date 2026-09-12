import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ---- Roadmaps ----

const createRoadmap = asyncHandler(async (req, res) => {
  const { title, description, order } = req.body;
  if (!title) throw new ApiError(400, 'Title is required');

  const { data, error } = await supabase.from('roadmaps').insert([{ title, description, order: order || 0 }]).select().single();
  if (error) throw new ApiError(500, error.message);

  return res.status(201).json(new ApiResponse(201, data, 'Roadmap created successfully'));
});

const updateRoadmap = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, order } = req.body;

  const { data, error } = await supabase.from('roadmaps').update({ title, description, order, updated_at: new Date() }).eq('id', id).select().single();
  if (error) throw new ApiError(500, error.message);

  return res.status(200).json(new ApiResponse(200, data, 'Roadmap updated'));
});

const deleteRoadmap = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('roadmaps').delete().eq('id', id);
  if (error) throw new ApiError(500, error.message);

  return res.status(200).json(new ApiResponse(200, null, 'Roadmap deleted'));
});


// ---- Courses ----

const createCourse = asyncHandler(async (req, res) => {
  const { roadmap_id, title, description, thumbnail_url, order } = req.body;
  if (!title) throw new ApiError(400, 'Title is required');

  const { data, error } = await supabase.from('courses').insert([{ roadmap_id, title, description, thumbnail_url, order: order || 0 }]).select().single();
  if (error) throw new ApiError(500, error.message);

  return res.status(201).json(new ApiResponse(201, data, 'Course created successfully'));
});

const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roadmap_id, title, description, thumbnail_url, order } = req.body;

  const { data, error } = await supabase.from('courses').update({ roadmap_id, title, description, thumbnail_url, order, updated_at: new Date() }).eq('id', id).select().single();
  if (error) throw new ApiError(500, error.message);

  return res.status(200).json(new ApiResponse(200, data, 'Course updated'));
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) throw new ApiError(500, error.message);

  return res.status(200).json(new ApiResponse(200, null, 'Course deleted'));
});


// ---- Lessons ----

const createLesson = asyncHandler(async (req, res) => {
  const { course_id, title, content, video_url, type, order } = req.body;
  if (!course_id || !title) throw new ApiError(400, 'Course ID and Title are required');

  const { data, error } = await supabase.from('course_lessons').insert([{ course_id, title, content, video_url, type: type || 'reading', order: order || 0 }]).select().single();
  if (error) throw new ApiError(500, error.message);

  return res.status(201).json(new ApiResponse(201, data, 'Lesson created successfully'));
});

const updateLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, video_url, type, order } = req.body;

  const { data, error } = await supabase.from('course_lessons').update({ title, content, video_url, type, order, updated_at: new Date() }).eq('id', id).select().single();
  if (error) throw new ApiError(500, error.message);

  return res.status(200).json(new ApiResponse(200, data, 'Lesson updated'));
});

const deleteLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('course_lessons').delete().eq('id', id);
  if (error) throw new ApiError(500, error.message);

  return res.status(200).json(new ApiResponse(200, null, 'Lesson deleted'));
});

export {
  createRoadmap, updateRoadmap, deleteRoadmap,
  createCourse, updateCourse, deleteCourse,
  createLesson, updateLesson, deleteLesson
};
