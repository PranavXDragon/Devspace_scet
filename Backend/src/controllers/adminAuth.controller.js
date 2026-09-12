import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { adminOtpEmail } from '../utils/emailTemplates.js';
import { sendEmail } from '../utils/sendEmail.js';
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

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !admin) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const { error: tokenError } = await supabase
    .from('tokens')
    .insert([{
      userId: admin.id,
      userType: 'Admin',
      type: 'AUTH_OTP',
      token: hashedOtp,
      expiresAt: expiresAt.toISOString()
    }]);

  if (tokenError) {
    throw new ApiError(500, 'Error generating OTP');
  }

  // Send Email
  try {
    const emailTemplate = adminOtpEmail(otp);
    await sendEmail({
      to: email,
      subject: "Devspace Admin Login OTP",
      html: emailTemplate.html,
      text: emailTemplate.text
    });
  } catch (err) {
    console.error("Error sending OTP email. Is SMTP configured?", err.message);
    if (process.env.NODE_ENV === 'production') {
      throw new ApiError(500, 'Error sending OTP email');
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n\n[LOCAL DEV] ADMIN OTP FOR ${email} IS: ${otp}\n\n`);
  }

  return res.status(200).json(new ApiResponse(200, {}, 'OTP sent to email'));
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
