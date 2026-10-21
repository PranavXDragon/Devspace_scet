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
  const email = req.clerkUser?.emailAddresses?.[0]?.emailAddress || req.userEmail;
  const studentId = req.student?.id;

  // Run queries safely in parallel
  const [
    registrationsRes,
    boardingPassesRes,
    certificatesRes,
    statsRowRes,
    attendanceRes,
    acceptedSubsRes,
    challengesRes,
    eventsRes,
    roadmapsRes
  ] = await Promise.allSettled([
    supabase.from('student_registrations').select('*').eq('email', email).order('created_at', { ascending: false }),
    supabase.from('boarding_passes').select('*').eq('studentEmail', email).order('created_at', { ascending: false }),
    supabase.from('certificates').select('*').eq('studentEmail', email).order('created_at', { ascending: false }),
    studentId ? supabase.from('student_stats').select('*').eq('student_id', studentId).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from('attendance_records').select('date, created_at').or(`student_id.eq.${studentId || 'none'},student_id.eq.${email}`).order('date', { ascending: false }),
    studentId ? supabase.from('code_submissions').select('id, created_at, status').eq('student_id', studentId).eq('status', 'Accepted') : Promise.resolve({ data: [] }),
    supabase.from('challenges').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('events').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date', { ascending: true }).limit(3),
    supabase.from('learning_roadmaps').select('*').limit(2)
  ]);

  const registrations = registrationsRes.status === 'fulfilled' ? registrationsRes.value?.data || [] : [];
  const boardingPasses = boardingPassesRes.status === 'fulfilled' ? boardingPassesRes.value?.data || [] : [];
  const certificates = certificatesRes.status === 'fulfilled' ? certificatesRes.value?.data || [] : [];
  const statsRow = statsRowRes.status === 'fulfilled' ? statsRowRes.value?.data : null;
  const attendanceList = attendanceRes.status === 'fulfilled' ? attendanceRes.value?.data || [] : [];
  const acceptedSubs = acceptedSubsRes.status === 'fulfilled' ? acceptedSubsRes.value?.data || [] : [];
  let latestChallenge = challengesRes.status === 'fulfilled' ? challengesRes.value?.data : null;
  let upcomingEventsList = eventsRes.status === 'fulfilled' ? eventsRes.value?.data || [] : [];
  const roadmapsList = roadmapsRes.status === 'fulfilled' ? roadmapsRes.value?.data || [] : [];

  // Fallbacks for challenge from coding_problems or questions
  if (!latestChallenge) {
    try {
      const { data: q } = await supabase
        .from('coding_problems')
        .select('id, title, difficulty, description')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (q) {
        latestChallenge = {
          id: q.id,
          title: q.title,
          difficulty: q.difficulty || 'Medium',
          reward_points: q.difficulty === 'Hard' ? 100 : q.difficulty === 'Medium' ? 50 : 25,
          type: 'question'
        };
      }
    } catch (e) {}
  }

  // Fallbacks for events from student_events if events table had none
  if (!upcomingEventsList.length) {
    try {
      const { data: studentEv } = await supabase.from('student_events').select('*').order('date_time', { ascending: true }).limit(3);
      if (studentEv && studentEv.length) {
        upcomingEventsList = studentEv.map(ev => ({
          id: ev.id,
          eventName: ev.title,
          date: ev.date_time,
          description: ev.description,
          location: ev.location,
          type: ev.type
        }));
      }
    } catch (e) {}
  }

  // Calculate real attendance streak
  const uniqueDates = Array.from(new Set(attendanceList.map(a => a.date?.split('T')[0]).filter(Boolean))).sort().reverse();
  let attendanceStreak = 0;
  if (uniqueDates.length > 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
      let currentCheck = new Date(uniqueDates[0]);
      attendanceStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevExpected = new Date(currentCheck);
        prevExpected.setDate(prevExpected.getDate() - 1);
        const prevExpectedStr = prevExpected.toISOString().split('T')[0];
        if (uniqueDates[i] === prevExpectedStr) {
          attendanceStreak++;
          currentCheck = prevExpected;
        } else {
          break;
        }
      }
    }
  }

  // Calculate real XP, Level, and Streak for this student
  const attendanceCount = attendanceList.length;
  const problemsSolvedCount = acceptedSubs.length;
  const baseChallengePoints = statsRow?.total_points || 0;
  
  // Award 50 XP per attendance check-in + 100 XP per problem solved + points from completed challenges
  const totalXP = baseChallengePoints + (attendanceCount * 50) + (problemsSolvedCount * 100);
  const level = Math.max(1, Math.floor(totalXP / 250) + 1);
  const xpNext = level * 250;
  const finalStreak = Math.max(statsRow?.current_streak || 0, attendanceStreak);

  // Collect distinct dates student was active (attendance check-in or code submission)
  const activityDates = Array.from(new Set([
    ...attendanceList.map(a => a.date?.split('T')[0]),
    ...acceptedSubs.map(s => s.created_at?.split('T')[0])
  ].filter(Boolean)));

  const clerkName = req.clerkUser?.firstName ? `${req.clerkUser.firstName} ${req.clerkUser.lastName || ''}`.trim() : 'Developer';
  
  const profile = req.student ? {
    id: req.student.id,
    name: req.student.name,
    email: req.student.email,
    studentId: req.student.studentId,
    course: req.student.course,
    year: req.student.year,
    semester: req.student.semester,
    phone: req.student.phone,
    github_username: req.student.github_username || req.clerkUser?.username || null
  } : {
    id: null,
    name: clerkName,
    email: email,
    studentId: 'Not Registered',
    course: 'N/A',
    year: 'N/A',
    semester: 'N/A',
    phone: 'N/A',
    github_username: req.clerkUser?.username || null
  };

  return res.status(200).json(
    new ApiResponse(200, {
      profile,
      registrations: registrations || [],
      boardingPasses: boardingPasses || [],
      certificates: certificates || [],
      stats: {
        xp: totalXP,
        level,
        xpNext,
        streak: finalStreak,
        problemsSolved: problemsSolvedCount,
        attendanceCount
      },
      todaysChallenge: latestChallenge,
      upcomingEvents: upcomingEventsList,
      learningCourses: roadmapsList,
      activityDates
    }, 'Student dashboard data fetched successfully')
  );
});

const updateGithubUsername = asyncHandler(async (req, res) => {
  const { github_username } = req.body;
  const email = req.clerkUser.emailAddresses[0].emailAddress;
  const cleanUsername = github_username && typeof github_username === 'string' && github_username.trim() !== ''
    ? github_username.trim().replace(/^@/, '')
    : null;

  // Optional: check with GitHub API if user exists
  if (cleanUsername) {
    try {
      const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
        headers: {
          'User-Agent': 'DevSpace-Coding-Club',
          'Accept': 'application/vnd.github.v3+json',
          ...(process.env.GITHUB_TOKEN ? { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } : {})
        }
      });
      if (ghRes.status === 404) {
        throw new ApiError(404, `GitHub account '@${cleanUsername}' does not exist.`);
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.warn("GitHub API verify notice:", err.message);
    }
  }

  // Update student_registrations by email
  const { data: updated, error } = await supabase
    .from('student_registrations')
    .update({ github_username: cleanUsername })
    .eq('email', email)
    .select()
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update GitHub username in database: " + error.message);
  }

  return res.status(200).json(
    new ApiResponse(
      200, 
      { github_username: cleanUsername, student: updated }, 
      cleanUsername ? `GitHub profile connected to @${cleanUsername}` : "GitHub profile disconnected"
    )
  );
});

const getResumeDraft = asyncHandler(async (req, res) => {
  if (!req.student || !req.student.id) {
    throw new ApiError(404, 'Student profile not found');
  }

  const { data: tokenDoc, error } = await supabase
    .from('tokens')
    .select('id, token, expiresAt')
    .eq('userId', req.student.id)
    .eq('userType', 'Student')
    .eq('type', 'RESUME_DRAFT')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, 'Failed to fetch resume draft: ' + error.message);
  }

  if (!tokenDoc || !tokenDoc.token) {
    return res.status(200).json(
      new ApiResponse(200, { resumeData: null, designSettings: null, updatedAt: null }, 'No cloud resume draft found')
    );
  }

  try {
    const parsed = JSON.parse(tokenDoc.token);
    return res.status(200).json(
      new ApiResponse(200, {
        resumeData: parsed.resumeData || null,
        designSettings: parsed.designSettings || null,
        updatedAt: parsed.updatedAt || null,
      }, 'Cloud resume draft retrieved successfully')
    );
  } catch (err) {
    return res.status(200).json(
      new ApiResponse(200, { resumeData: null, designSettings: null, updatedAt: null }, 'Corrupted cloud resume draft')
    );
  }
});

const saveResumeDraft = asyncHandler(async (req, res) => {
  if (!req.student || !req.student.id) {
    throw new ApiError(404, 'Student profile not found');
  }

  const { resumeData, designSettings } = req.body;

  if (!resumeData) {
    throw new ApiError(400, 'resumeData is required');
  }

  const updatedAt = new Date().toISOString();
  const payload = JSON.stringify({
    resumeData,
    designSettings: designSettings || {},
    updatedAt
  });

  const { data: existingToken, error: fetchError } = await supabase
    .from('tokens')
    .select('id')
    .eq('userId', req.student.id)
    .eq('userType', 'Student')
    .eq('type', 'RESUME_DRAFT')
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    throw new ApiError(500, 'Database error while checking existing draft: ' + fetchError.message);
  }

  if (existingToken) {
    const { error: updateError } = await supabase
      .from('tokens')
      .update({
        token: payload,
        expiresAt: '2099-12-31T23:59:59.000Z'
      })
      .eq('id', existingToken.id);

    if (updateError) {
      throw new ApiError(500, 'Failed to update cloud resume draft: ' + updateError.message);
    }
  } else {
    const { error: insertError } = await supabase
      .from('tokens')
      .insert([{
        userId: req.student.id,
        userType: 'Student',
        type: 'RESUME_DRAFT',
        token: payload,
        expiresAt: '2099-12-31T23:59:59.000Z'
      }]);

    if (insertError) {
      throw new ApiError(500, 'Failed to save cloud resume draft: ' + insertError.message);
    }
  }

  return res.status(200).json(
    new ApiResponse(200, { updatedAt }, 'Resume draft saved to cloud successfully')
  );
});

export { loginStudent, verifyOtp, logoutStudent, getStudentDashboard, updateGithubUsername, getResumeDraft, saveResumeDraft };
