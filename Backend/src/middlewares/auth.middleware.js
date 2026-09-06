import { requireAuth } from '@clerk/express';

// Re-export requireAuth as verifyJWT so that existing routes don't break
export const verifyJWT = requireAuth();
