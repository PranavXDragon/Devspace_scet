import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unauthorized request');
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken?.sessionId) {
      throw new ApiError(401, 'Invalid session token format');
    }

    if (decodedToken?.role !== 'Admin') {
      throw new ApiError(403, 'Access denied. Admin resources only.');
    }

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', decodedToken.sessionId)
      .single();

    if (sessionError || !session || session.token !== token) {
      throw new ApiError(401, 'Session expired or invalid');
    }

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', decodedToken?._id)
      .single();

    if (adminError || !admin) {
      throw new ApiError(401, 'Invalid Access Token');
    }

    delete admin.password;

    req.admin = admin;
    // Map _id property to match what controllers are checking (req.admin._id)
    req.admin._id = admin.id; 
    req.sessionId = session.id;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid access token');
  }
});
