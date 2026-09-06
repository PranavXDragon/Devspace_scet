import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

export const updateProfile = asyncHandler(async (req, res) => {
  // We can leave this as a stub or update it to use Clerk API if needed
  return res.status(200).json(new ApiResponse(200, {}, 'Profile update should be handled via Clerk dashboard'));
});

export const getCurrentAdmin = asyncHandler(async (req, res) => {
  // Just return the Clerk userId
  return res.status(200).json(
    new ApiResponse(200, { id: req.auth.userId }, 'Current admin fetched successfully')
  );
});

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const [
    { count: pendingApps },
    { count: totalApps },
    { count: activeEvents },
    { count: teamSize },
    { data: recentLogs }
  ] = await Promise.all([
    supabase.from('student_registrations').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    supabase.from('student_registrations').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('team_members').select('*', { count: 'exact', head: true }),
    supabase.from('student_registrations').select('*').order('created_at', { ascending: false }).limit(5)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      metrics: {
        pendingApps: pendingApps || 0,
        totalApps: totalApps || 0,
        activeEvents: activeEvents || 0,
        liveSessions: 1, // Clerk handles this now
        teamSize: teamSize || 0,
      },
      recentLogs: recentLogs || []
    }, 'Dashboard metrics fetched successfully')
  );
});