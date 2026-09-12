import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.adminToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request. Missing admin token.");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'devspace_admin_secret');
    
    if (decodedToken.role !== 'Admin') {
      throw new ApiError(403, "Forbidden. Requires admin privileges.");
    }

    req.admin = decodedToken;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
