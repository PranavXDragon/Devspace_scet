import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { supabase } from "../config/supabase.js";

const healthcheck = asyncHandler(async (req, res) => {
  // Ping Supabase to keep the database alive on free tiers
  try {
    const { error } = await supabase.from('admins').select('id').limit(1);
    if (error) throw error;
  } catch (dbError) {
    console.error("Supabase ping failed:", dbError);
    return res.status(503).json(new ApiResponse(503, { status: "Degraded" }, "Backend is running, but database connection failed."));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { status: "Active" }, "OK - Backend & Supabase are running smoothly!"));
});

export { healthcheck };
