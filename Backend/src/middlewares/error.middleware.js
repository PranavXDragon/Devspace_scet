import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // 1. Handle Supabase (PostgREST) Errors
  if (err.code === '23505') { // unique_violation
    const message = `A record with this information already exists.`;
    error = new ApiError(409, message);
  } else if (err.code === '23503') { // foreign_key_violation
    const message = `Referenced record does not exist.`;
    error = new ApiError(400, message);
  } else if (err.code && typeof err.code === 'string' && err.code.length === 5) {
    // Postgres error codes are typically 5 characters
    error = new ApiError(400, err.message || "Database error occurred");
  }
  // 4. Handle JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    const message = "Invalid session token. Please log in again.";
    error = new ApiError(401, message);
  }
  else if (err.name === 'TokenExpiredError') {
    const message = "Your session has expired. Please log in again.";
    error = new ApiError(401, message);
  }
  // 5. Handle Multer Errors
  else if (err.name === 'MulterError') {
    let message = "File upload error occurred.";
    if (err.code === 'LIMIT_FILE_SIZE') message = "File is too large. Please upload a smaller file.";
    error = new ApiError(400, message);
  }
  // 6. Generic Fallback
  else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    
    // Mask the message in production for true 500 errors
    let message = error.message || "Internal Server Error";
    // TEMPORARILY DISABLED MASKING TO DEBUG VERCEL ERROR
    // if (process.env.NODE_ENV === "production" && statusCode === 500) {
    //   message = "An unexpected server error occurred. Our team has been notified.";
    // }

    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Construct standard professional response explicitly to avoid leaking raw object properties
  const response = {
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}), // Stack trace only in development
  };

  return res.status(error.statusCode || 500).json(response);
};

export { errorHandler };
