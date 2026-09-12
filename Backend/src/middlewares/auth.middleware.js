import { getAuth } from '@clerk/express';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const auth = getAuth(req);
  if (!auth || !auth.userId) {
    throw new ApiError(401, 'Unauthorized request');
  }
  next();
});
