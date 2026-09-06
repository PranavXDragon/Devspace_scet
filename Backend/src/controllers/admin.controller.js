import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/sendEmail.js';
import { uploadOnCloudinary, updateOnCloudinary, getPublicIdFromUrl } from '../utils/cloudinary.js';
import { adminOtpEmail, passwordChangeOtpEmail, passwordChangedSuccessEmail } from '../utils/emailTemplates.js';
import ms from 'ms';
import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateAuthSession = async (admin, req) => {
  try {
    const rawUserAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(rawUserAgent);
    const parsedUA = parser.getResult();

    const os = `${parsedUA.os.name || ''} ${parsedUA.os.version || ''}`.trim() || 'Unknown OS';
    const browser = `${parsedUA.browser.name || ''} ${parsedUA.browser.version || ''}`.trim() || 'Unknown Browser';
    const deviceType = parsedUA.device.type ?
      parsedUA.device.type.charAt(0).toUpperCase() + parsedUA.device.type.slice(1) : 'Desktop';

    // Insert temp session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert([{
        adminId: admin.id,
        token: 'temp',
        expiresAt: new Date(Date.now() + ms(process.env.ACCESS_TOKEN_EXPIRY || '10d')).toISOString(),
        userAgent: rawUserAgent,
        os,
        browser,
        device: deviceType,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Unknown IP',
      }])
      .select()
      .single();

    if (sessionError) throw new Error(sessionError.message);

    // Generate JWT
    const token = jwt.sign(
      {
        _id: admin.id,
        email: admin.email,
        sessionId: session.id,
        role: 'Admin',
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );

    // Update real token
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ token })
      .eq('id', session.id);

    if (updateError) throw new Error(updateError.message);

    return token;
  } catch (error) {
    console.error("Session Generation Error:", error);
    throw new ApiError(500, `Something went wrong while generating session: ${error.message}`);
  }
};

const loginAdmin = asyncHandler(async (req, res) => {
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
    throw new ApiError(404, 'Admin does not exist');
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }
  
  const { data: existingOtp } = await supabase
    .from('tokens')
    .select('*')
    .eq('userId', admin.id)
    .eq('userType', 'Admin')
    .eq('type', 'AUTH_OTP')
    .single();

  if (existingOtp) {
    return res.status(200).json(
      new ApiResponse(200, {}, 'OTP already sent, Please check your email')
    );
  }
  
  const otp = crypto.randomInt(100000, 1000000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  const { error: tokenError } = await supabase
    .from('tokens')
    .insert([{
      userId: admin.id,
      userType: 'Admin',
      token: hashedOtp,
      type: 'AUTH_OTP',
      description: 'Auth OTP',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    }]);

  if (tokenError) throw new ApiError(500, 'Error creating OTP token');

  const { html, text } = adminOtpEmail(otp);

  try {
    if (process.env.SMTP_USER === 'your_smtp_user' || !process.env.SMTP_USER) {
      console.log(`\n\n=========================================\n`);
      console.log(`[MOCK EMAIL] OTP for ${admin.email}: ${otp}`);
      console.log(`\n=========================================\n\n`);
    } else {
      await sendEmail({
        email: admin.email,
        subject: 'Devspace Admin Login OTP',
        message: html,
        textMessage: text,
      });
    }
  } catch (error) {
    await supabase.from('tokens').delete().eq('userId', admin.id).eq('type', 'AUTH_OTP');
    throw new ApiError(500, 'Error sending OTP email');
  }

  return res.status(200).json(
    new ApiResponse(200, {}, 'OTP sent successfully to admin email (Check server console if SMTP is not configured)')
  );
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required');
  }

  const { data: admin } = await supabase.from('admins').select('*').eq('email', email).single();

  if (!admin) {
    throw new ApiError(404, 'Admin not found');
  }

  const { data: tokenDoc } = await supabase
    .from('tokens')
    .select('*')
    .eq('userId', admin.id)
    .eq('userType', 'Admin')
    .eq('type', 'AUTH_OTP')
    .single();

  if (!tokenDoc) {
    throw new ApiError(400, 'OTP not requested or has expired');
  }

  const isOtpValid = await bcrypt.compare(otp, tokenDoc.token);

  if (!isOtpValid || new Date(tokenDoc.expiresAt) < new Date()) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  await supabase.from('tokens').delete().eq('id', tokenDoc.id);

  const token = await generateAuthSession(admin, req);

  delete admin.password;

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 10 * 24 * 60 * 60 * 1000, 
  };

  return res
    .status(200)
    .cookie('accessToken', token, options)
    .json(
      new ApiResponse(
        200,
        {
          admin,
          token,
        },
        'Admin logged in successfully'
      )
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {
  if (req.sessionId) {
    await supabase.from('sessions').delete().eq('id', req.sessionId);
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .json(new ApiResponse(200, {}, 'Admin logged out'));
});

const getAdminSessions = asyncHandler(async (req, res) => {
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('adminId', req.admin._id)
    .order('created_at', { ascending: false });

  return res.status(200).json(new ApiResponse(200, sessions, 'Active sessions fetched successfully'));
});

const killSession = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.sessionId.toString() === id) {
    throw new ApiError(400, "Cannot kill your current active session from this endpoint. Please use logout instead.");
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)
    .eq('adminId', req.admin._id)
    .select()
    .single();

  if (error || !session) {
    throw new ApiError(404, 'Session not found or already deleted');
  }

  return res.status(200).json(new ApiResponse(200, {}, 'Session killed successfully'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, mobileNumber } = req.body;
  const { data: admin } = await supabase.from('admins').select('*').eq('id', req.admin._id).single();

  let profilePhotoUrl = admin.profilePhoto;

  if (req.file) {
    if (admin.profilePhoto) {
      const oldPublicId = getPublicIdFromUrl(admin.profilePhoto);
      const uploadedImage = await updateOnCloudinary(req.file.path, oldPublicId);
      if (!uploadedImage) throw new ApiError(500, 'Error updating profile photo');
      profilePhotoUrl = uploadedImage.url;
    } else {
      const uploadedImage = await uploadOnCloudinary(req.file.path, 'Devspace/profile');
      if (!uploadedImage) throw new ApiError(500, 'Error uploading profile photo');
      profilePhotoUrl = uploadedImage.url;
    }
  }

  if (!name && !mobileNumber && !req.file) {
    throw new ApiError(400, 'Please provide fields to update');
  }

  const updates = {};
  if (name) updates.name = name;
  if (mobileNumber) updates.mobileNumber = mobileNumber;
  if (profilePhotoUrl) updates.profilePhoto = profilePhotoUrl;
  updates.updated_at = new Date().toISOString();

  const { data: updatedAdmin, error } = await supabase
    .from('admins')
    .update(updates)
    .eq('id', req.admin._id)
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);

  delete updatedAdmin.password;

  return res
    .status(200)
    .json(new ApiResponse(200, updatedAdmin, 'Admin profile updated successfully'));
});

const requestPasswordChange = asyncHandler(async (req, res) => {
  const { oldPassword } = req.body;

  if (!oldPassword) {
    throw new ApiError(400, 'Old password is required');
  }

  const { data: admin } = await supabase.from('admins').select('*').eq('id', req.admin._id).single();

  const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
  if (!isPasswordValid) {
    throw new ApiError(400, 'Invalid old password');
  }

  const { data: existingOtp } = await supabase
    .from('tokens')
    .select('*')
    .eq('userId', admin.id)
    .eq('userType', 'Admin')
    .eq('type', 'RESET_PASSWORD')
    .single();

  if (existingOtp) {
    return res.status(200).json(
      new ApiResponse(200, {}, 'OTP already sent, please check your email')
    );
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  const { error: tokenError } = await supabase.from('tokens').insert([{
    userId: admin.id,
    userType: 'Admin',
    token: hashedOtp,
    type: 'RESET_PASSWORD',
    description: 'Password Change OTP',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  }]);

  if (tokenError) throw new ApiError(500, 'Error creating OTP token');

  const { html, text } = passwordChangeOtpEmail(otp);

  try {
    await sendEmail({
      email: admin.email,
      subject: 'Devspace Password Change OTP',
      message: html,
      textMessage: text,
    });
  } catch (error) {
    await supabase.from('tokens').delete().eq('userId', admin.id).eq('type', 'RESET_PASSWORD');
    throw new ApiError(500, 'Error sending OTP email');
  }

  return res.status(200).json(
    new ApiResponse(200, {}, 'OTP sent successfully to admin email')
  );
});

const changePassword = asyncHandler(async (req, res) => {
  const { newPassword, otp } = req.body;

  if (!newPassword || !otp) {
    throw new ApiError(400, 'New password and OTP are required');
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    throw new ApiError(400, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)');
  }

  const { data: admin } = await supabase.from('admins').select('*').eq('id', req.admin._id).single();

  const { data: tokenDoc } = await supabase
    .from('tokens')
    .select('*')
    .eq('userId', admin.id)
    .eq('userType', 'Admin')
    .eq('type', 'RESET_PASSWORD')
    .single();

  if (!tokenDoc) {
    throw new ApiError(400, 'OTP not requested or has expired');
  }

  const isOtpValid = await bcrypt.compare(otp, tokenDoc.token);

  if (!isOtpValid || new Date(tokenDoc.expiresAt) < new Date()) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  await supabase.from('tokens').delete().eq('id', tokenDoc.id);

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await supabase.from('admins').update({ password: hashedPassword }).eq('id', admin.id);

  const { html, text } = passwordChangedSuccessEmail();
  try {
    await sendEmail({
      email: admin.email,
      subject: 'Devspace Password Changed',
      message: html,
      textMessage: text,
    });
  } catch (error) {
    console.error("Failed to send password changed success email", error);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'));
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, req.admin, 'Current admin fetched successfully')
  );
});

const getDashboardMetrics = asyncHandler(async (req, res) => {
  const [
    { count: pendingApps },
    { count: totalApps },
    { count: activeEvents },
    { count: liveSessions },
    { count: teamSize },
    { data: recentLogs }
  ] = await Promise.all([
    supabase.from('student_registrations').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    supabase.from('student_registrations').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('sessions').select('*', { count: 'exact', head: true }),
    supabase.from('team_members').select('*', { count: 'exact', head: true }),
    supabase.from('student_registrations').select('*').order('created_at', { ascending: false }).limit(5)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      metrics: {
        pendingApps: pendingApps || 0,
        totalApps: totalApps || 0,
        activeEvents: activeEvents || 0,
        liveSessions: liveSessions || 0,
        teamSize: teamSize || 0,
      },
      recentLogs: recentLogs || []
    }, 'Dashboard metrics fetched successfully')
  );
});

export { loginAdmin, verifyOtp, logoutAdmin, updateProfile, requestPasswordChange, changePassword, getAdminSessions, killSession, getCurrentAdmin, getDashboardMetrics };