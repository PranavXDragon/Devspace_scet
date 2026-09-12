import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get all roadmaps and their nested courses
const getRoadmaps = asyncHandler(async (req, res) => {
  const { data: roadmaps, error: roadmapsError } = await supabase
    .from('roadmaps')
    .select('*, courses(*)')
    .order('order', { ascending: true })
    .order('order', { referencedTable: 'courses', ascending: true });

  if (roadmapsError) {
    throw new ApiError(500, 'Failed to fetch roadmaps: ' + roadmapsError.message);
  }

  return res.status(200).json(
    new ApiResponse(200, roadmaps, 'Roadmaps fetched successfully')
  );
});

// Get detailed info for a specific course including its lessons
const getCourseDetails = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) throw new ApiError(400, 'Course ID is required');

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*, course_lessons(*)')
    .eq('id', courseId)
    .order('order', { referencedTable: 'course_lessons', ascending: true })
    .single();

  if (courseError || !course) {
    throw new ApiError(404, 'Course not found');
  }

  return res.status(200).json(
    new ApiResponse(200, course, 'Course details fetched successfully')
  );
});

// Get user progress
const getMyProgress = asyncHandler(async (req, res) => {
  if (!req.clerkUser || !req.clerkUser.emailAddresses?.length) {
     throw new ApiError(401, 'Unauthorized');
  }
  const email = req.clerkUser.emailAddresses[0].emailAddress;

  const { data: progress, error: progressError } = await supabase
    .from('student_lesson_progress')
    .select('*')
    .eq('student_email', email);

  if (progressError) {
    throw new ApiError(500, 'Failed to fetch progress');
  }

  return res.status(200).json(
    new ApiResponse(200, progress, 'Progress fetched successfully')
  );
});

// Update progress (mark lesson as complete)
const markLessonComplete = asyncHandler(async (req, res) => {
  if (!req.clerkUser || !req.clerkUser.emailAddresses?.length) {
    throw new ApiError(401, 'Unauthorized');
  }
  const email = req.clerkUser.emailAddresses[0].emailAddress;
  const { courseId, lessonId, status } = req.body;

  if (!courseId || !lessonId) {
    throw new ApiError(400, 'Course ID and Lesson ID are required');
  }

  if (status === 'completed') {
    // Insert or update (upsert)
    const { data, error } = await supabase
      .from('student_lesson_progress')
      .upsert({
        student_email: email,
        course_id: courseId,
        lesson_id: lessonId,
        status: 'completed',
        completed_at: new Date()
      }, { onConflict: 'student_email,lesson_id' })
      .select()
      .single();

    if (error) throw new ApiError(500, 'Failed to mark complete: ' + error.message);
    
    return res.status(200).json(new ApiResponse(200, data, 'Lesson marked complete'));
  } else {
    // Remove completion
    const { error } = await supabase
      .from('student_lesson_progress')
      .delete()
      .match({ student_email: email, lesson_id: lessonId });

    if (error) throw new ApiError(500, 'Failed to mark incomplete: ' + error.message);

    return res.status(200).json(new ApiResponse(200, null, 'Lesson marked incomplete'));
  }
});

export { getRoadmaps, getCourseDetails, getMyProgress, markLessonComplete };
