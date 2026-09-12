import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { supabase } from '../config/supabase.js';
import { clerkClient, getAuth } from '@clerk/express';

export const verifyStudentJWT = [
  asyncHandler(async (req, res, next) => {
    try {
      const auth = getAuth(req);
      
      if (!auth || !auth.userId) {
        throw new ApiError(401, 'Unauthorized request');
      }

      // Fetch the user from Clerk to get their email address
      const user = await clerkClient.users.getUser(auth.userId);
      
      if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
        throw new ApiError(401, 'Clerk user has no email address');
      }
      
      const email = user.emailAddresses[0].emailAddress;

      // Find the student in Supabase by email
      const { data: student, error: studentError } = await supabase
        .from('student_registrations')
        .select('*')
        .eq('email', email)
        .limit(1);

      // Attach Clerk user and Student record (if exists)
      req.clerkUser = user;
      req.student = student && student.length > 0 ? student[0] : null;
      
      next();
    } catch (error) {
      console.error('verifyStudentJWT Error:', error);
      throw new ApiError(error.statusCode || 401, error?.message || 'Invalid access token');
    }
  })
];
