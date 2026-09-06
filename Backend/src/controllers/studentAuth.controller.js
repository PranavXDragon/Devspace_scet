import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/sendEmail.js';
import { adminOtpEmail } from '../utils/emailTemplates.js'; // Can reuse the same email template
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateStudentToken = (email) => {
  return jwt.sign(
    {
      email,
      role: 'Student',
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '10d',
    }
  );
};

const loginStudent = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  // Check if student exists in registrations
  const { data: student, error } = await supabase
    .from('student_registrations')
    .select('id, name, email')
    .eq('email', email)
    .limit(1);

  if (error || !student || student.length === 0) {
    throw new ApiError(404, 'No registration found with this email');
  }

  const studentData = student[0];

  // BYPASS OTP FOR NOW: Generate token immediately
  const token = generateStudentToken(studentData.email);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 10 * 24 * 60 * 60 * 1000, 
  };

  return res
    .status(200)
    .cookie('studentToken', token, options)
    .json(
      new ApiResponse(
        200,
        {
          student: {
            name: studentData.name,
            email: studentData.email,
          },
          token,
        },
        'Logged in successfully'
      )
    );
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required');
  }

  const { data: studentArr, error: studentError } = await supabase
    .from('student_registrations')
    .select('*')
    .eq('email', email)
    .limit(1);

  if (studentError || !studentArr || studentArr.length === 0) {
    throw new ApiError(404, 'Student not found');
  }

  const student = studentArr[0];

  const { data: tokenDoc } = await supabase
    .from('tokens')
    .select('*')
    .eq('userId', student.id)
    .eq('userType', 'Student')
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

  const token = generateStudentToken(student.email);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 10 * 24 * 60 * 60 * 1000, 
  };

  return res
    .status(200)
    .cookie('studentToken', token, options)
    .json(
      new ApiResponse(
        200,
        {
          student: {
            name: student.name,
            email: student.email,
            studentId: student.studentId,
            course: student.course,
            year: student.year
          },
          token,
        },
        'Logged in successfully'
      )
    );
});

const logoutStudent = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .clearCookie('studentToken', options)
    .json(new ApiResponse(200, {}, 'Logged out successfully'));
});

const getStudentDashboard = asyncHandler(async (req, res) => {
  const email = req.student.email;

  const [
    { data: registrations },
    { data: boardingPasses },
    { data: certificates }
  ] = await Promise.all([
    supabase.from('student_registrations').select('*').eq('email', email).order('created_at', { ascending: false }),
    supabase.from('boarding_passes').select('*').eq('studentEmail', email).order('created_at', { ascending: false }),
    supabase.from('certificates').select('*').eq('studentEmail', email).order('created_at', { ascending: false }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      profile: {
        name: req.student.name,
        email: req.student.email,
        studentId: req.student.studentId,
        course: req.student.course,
        year: req.student.year,
        semester: req.student.semester,
        phone: req.student.phone
      },
      registrations: registrations || [],
      boardingPasses: boardingPasses || [],
      certificates: certificates || []
    }, 'Student dashboard data fetched successfully')
  );
});

export { loginStudent, verifyOtp, logoutStudent, getStudentDashboard };
