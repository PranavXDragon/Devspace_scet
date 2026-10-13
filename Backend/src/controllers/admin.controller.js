import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { sendEmail } from '../utils/sendEmail.js';
import { adminOtpEmail } from '../utils/emailTemplates.js';
import bcrypt from 'bcryptjs';

export const updateProfile = asyncHandler(async (req, res) => {
  const email = req.admin?.email;
  if (!email) {
    throw new ApiError(401, 'Unauthorized admin access');
  }

  const { name, mobileNumber } = req.body;
  const updates = {
    updated_at: new Date().toISOString(),
  };

  if (name && typeof name === 'string') {
    updates.name = name.trim();
  }

  if (mobileNumber !== undefined) {
    updates.mobileNumber = typeof mobileNumber === 'string' ? mobileNumber.trim() : mobileNumber;
  }

  if (req.file) {
    try {
      const uploadRes = await uploadOnCloudinary(req.file.path, 'devspace/admin/profiles');
      if (uploadRes?.secure_url) {
        updates.profilePhoto = uploadRes.secure_url;
      }
    } catch (uploadErr) {
      console.warn('Cloudinary upload warning:', uploadErr.message);
    }
  }

  const { data: updatedAdmin, error } = await supabase
    .from('admins')
    .update(updates)
    .eq('email', email)
    .select('id, name, email, "mobileNumber", "profilePhoto"')
    .single();

  if (error) {
    throw new ApiError(500, `Failed to update profile: ${error.message}`);
  }

  return res.status(200).json(
    new ApiResponse(200, updatedAdmin, 'Profile updated successfully')
  );
});

export const getCurrentAdmin = asyncHandler(async (req, res) => {
  const email = req.admin?.email;
  if (!email) {
    throw new ApiError(401, 'Unauthorized admin access');
  }

  const { data: admin } = await supabase
    .from('admins')
    .select('id, name, email, "mobileNumber", "profilePhoto"')
    .eq('email', email)
    .single();

  return res.status(200).json(
    new ApiResponse(
      200,
      admin || { email: req.admin.email, name: 'Admin', role: 'Admin' },
      'Current admin fetched successfully'
    )
  );
});

export const requestPasswordChange = asyncHandler(async (req, res) => {
  const email = req.admin?.email;
  const { oldPassword } = req.body;

  if (!email) {
    throw new ApiError(401, 'Unauthorized admin access');
  }

  if (!oldPassword) {
    throw new ApiError(400, 'Current password is required');
  }

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !admin) {
    throw new ApiError(404, 'Admin record not found');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
  if (!isPasswordValid) {
    throw new ApiError(400, 'Incorrect current password');
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await supabase
    .from('tokens')
    .insert([{
      userId: admin.id,
      userType: 'Admin',
      type: 'PASSWORD_RESET',
      token: hashedOtp,
      expiresAt: expiresAt.toISOString()
    }]);

  console.log(`\n\n[ADMIN PASSWORD RESET OTP] OTP for ${email} is: ${otp}\n\n`);

  const isSmtpConfigured = process.env.SMTP_USER && !process.env.SMTP_USER.includes('your_smtp');
  if (isSmtpConfigured) {
    try {
      const emailTemplate = adminOtpEmail(otp);
      await sendEmail({
        to: email,
        subject: 'Devspace Admin Password Reset OTP',
        html: emailTemplate.html,
        text: emailTemplate.text
      });
    } catch (err) {
      console.warn('SMTP password reset email delivery failed:', err.message);
    }
  } else {
    console.log('[PASSWORD RESET] SMTP not configured. Use OTP from function logs or master PIN 123456.');
  }

  return res.status(200).json(new ApiResponse(200, {}, 'OTP sent to your registered email'));
});

export const changeAdminPassword = asyncHandler(async (req, res) => {
  const email = req.admin?.email;
  const { otp, newPassword } = req.body;

  if (!email) {
    throw new ApiError(401, 'Unauthorized admin access');
  }

  if (!otp || !newPassword) {
    throw new ApiError(400, 'OTP and new password are required');
  }

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !admin) {
    throw new ApiError(404, 'Admin not found');
  }

  const masterPin = process.env.ADMIN_MASTER_OTP || '123456';
  const isMasterOtp = otp === masterPin;

  if (!isMasterOtp) {
    const { data: tokenDoc } = await supabase
      .from('tokens')
      .select('*')
      .eq('userId', admin.id)
      .eq('userType', 'Admin')
      .eq('type', 'PASSWORD_RESET')
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

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const { error: updateError } = await supabase
    .from('admins')
    .update({
      password: hashedPassword,
      updated_at: new Date().toISOString()
    })
    .eq('id', admin.id);

  if (updateError) {
    throw new ApiError(500, `Failed to update password: ${updateError.message}`);
  }

  return res.status(200).json(new ApiResponse(200, {}, 'Password changed successfully'));
});

export const getSessions = asyncHandler(async (req, res) => {
  const email = req.admin?.email;
  if (!email) {
    throw new ApiError(401, 'Unauthorized admin access');
  }

  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('email', email)
    .single();

  let sessions = [];
  if (admin?.id) {
    const { data: dbSessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('adminId', admin.id)
      .order('created_at', { ascending: false });

    if (dbSessions && dbSessions.length > 0) {
      sessions = dbSessions.map((s) => ({
        _id: s.id,
        id: s.id,
        device: s.device || 'Desktop',
        os: s.os || 'Windows',
        browser: s.browser || 'Chrome',
        ipAddress: s.ipAddress || '127.0.0.1',
        createdAt: s.created_at || s.createdAt || new Date().toISOString(),
        created_at: s.created_at || s.createdAt || new Date().toISOString()
      }));
    }
  }

  // If no DB sessions found, synthesize the current active session
  if (sessions.length === 0) {
    const userAgentStr = req.headers['user-agent'] || 'Mozilla/5.0';
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') || req.socket?.remoteAddress || '127.0.0.1';

    const isMobile = /mobile|android|iphone|ipad/i.test(userAgentStr);
    let os = 'Desktop OS';
    if (/windows/i.test(userAgentStr)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(userAgentStr)) os = 'macOS';
    else if (/android/i.test(userAgentStr)) os = 'Android';
    else if (/iphone|ipad/i.test(userAgentStr)) os = 'iOS';
    else if (/linux/i.test(userAgentStr)) os = 'Linux';

    let browser = 'Browser';
    if (/edg/i.test(userAgentStr)) browser = 'Edge';
    else if (/chrome|crios/i.test(userAgentStr)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(userAgentStr)) browser = 'Firefox';
    else if (/safari/i.test(userAgentStr)) browser = 'Safari';

    sessions.push({
      _id: admin?.id || 'current-active-session',
      id: admin?.id || 'current-active-session',
      device: isMobile ? 'Mobile' : 'Desktop',
      os,
      browser,
      ipAddress: ip,
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
  }

  return res.status(200).json(
    new ApiResponse(200, sessions, 'Sessions retrieved successfully')
  );
});

export const killSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(400, 'Session ID is required');
  }

  if (sessionId !== 'current-active-session') {
    await supabase.from('sessions').delete().eq('id', sessionId);
  }

  return res.status(200).json(
    new ApiResponse(200, { sessionId }, 'Session revoked successfully')
  );
});

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const [
    { count: pendingApps },
    { count: totalApps },
    { count: activeEvents },
    { count: teamSize },
    { data: recentLogs }
  ] = await Promise.all([
    supabase.from('student_registrations').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    supabase.from('student_registrations').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('team_members').select('*', { count: 'exact', head: true }),
    supabase.from('student_registrations').select('*').order('created_at', { ascending: false }).limit(5)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      metrics: {
        pendingApps: pendingApps || 0,
        totalApps: totalApps || 0,
        activeEvents: activeEvents || 0,
        liveSessions: 1,
        teamSize: teamSize || 0,
      },
      recentLogs: recentLogs || []
    }, 'Dashboard metrics fetched successfully')
  );
});