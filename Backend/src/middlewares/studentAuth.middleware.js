import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const verifyStudentJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.studentToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unauthorized request');
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (decodedToken?.role !== 'Student') {
      throw new ApiError(403, 'Access denied. Student resources only.');
    }

    const { data: student, error: studentError } = await supabase
      .from('student_registrations')
      .select('*')
      .eq('email', decodedToken.email)
      .limit(1);

    if (studentError || !student || student.length === 0) {
      throw new ApiError(401, 'Invalid Access Token');
    }

    req.student = student[0];
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid access token');
  }
});
