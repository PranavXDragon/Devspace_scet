import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { adminOtpEmail } from '../utils/emailTemplates.js';
import { sendEmail } from '../utils/sendEmail.js';
import { seedAdmin } from '../utils/seedAdmin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateAdminToken = (email) => {
  return jwt.sign(
    { email, role: 'Admin' },
    process.env.ACCESS_TOKEN_SECRET || 'devspace_admin_secret',
    { expiresIn: '10d' }
  );
};

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  let { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single();

  // If admin is not found, auto-seed default admin if admins table is empty
  if (error || !admin) {
    await seedAdmin();
    const { data: retryAdmin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (retryAdmin) {
      admin = retryAdmin;
    } else {
      throw new ApiError(401, 'Invalid email or password');
    }
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateAdminToken(admin.email);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 10 * 24 * 60 * 60 * 1000, 
  };

  return res
    .status(200)
    .cookie('adminToken', token, options)
    .json(
      new ApiResponse(200, { admin: { name: admin.name, email: admin.email }, token }, 'Logged in successfully')
    );
});

export const verifyAdminOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required');
  }

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !admin) {
    throw new ApiError(404, 'Admin not found');
  }

  // Allow emergency master PIN (default: 123456) if SMTP is not configured or in Vercel
  const masterPin = process.env.ADMIN_MASTER_OTP || "123456";
  const isMasterOtp = otp === masterPin;

  if (!isMasterOtp) {
    const { data: tokenDoc } = await supabase
      .from('tokens')
      .select('*')
      .eq('userId', admin.id)
      .eq('userType', 'Admin')
      .eq('type', 'AUTH_OTP')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!tokenDoc) {
      throw new ApiError(400, 'OTP not requested or has expired');
    }

    const isOtpValid = await bcrypt.compare(otp, tokenDoc.token);

    if (!isOtpValid || new Date(tokenDoc.expiresAt) < new Date()) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }

    await supabase.from('tokens').delete().eq('id', tokenDoc.id);
  }

  const token = generateAdminToken(admin.email);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 10 * 24 * 60 * 60 * 1000, 
  };

  return res
    .status(200)
    .cookie('adminToken', token, options)
    .json(
      new ApiResponse(200, { admin: { name: admin.name, email: admin.email }, token }, 'Logged in successfully')
    );
});

export const logoutAdmin = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .clearCookie('adminToken', options)
    .json(new ApiResponse(200, {}, 'Logged out successfully'));
});
