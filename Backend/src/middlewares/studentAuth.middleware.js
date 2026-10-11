import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { supabase } from '../config/supabase.js';
import { clerkClient, getAuth } from '@clerk/express';

export const verifyStudentJWT = [
  asyncHandler(async (req, res, next) => {
    try {
      const auth = getAuth(req);
      
      if (!auth || !auth.userId) {
        throw new ApiError(401, 'Unauthorized request');
      }

      // Fetch the user from Clerk to get their email address
      const user = await clerkClient.users.getUser(auth.userId);
      
      if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
        throw new ApiError(401, 'Clerk user has no email address');
      }
      
      const email = user.emailAddresses[0].emailAddress;

      // Find the student in Supabase by email
      let { data: student, error: studentError } = await supabase
        .from('student_registrations')
        .select('*')
        .eq('email', email)
        .limit(1);

      let studentRecord = student && student.length > 0 ? student[0] : null;

      // Auto-register Clerk user in student_registrations if not yet registered
      if (!studentRecord) {
        try {
          const clerkName = (user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Developer').trim();
          const randId = Math.floor(10000 + Math.random() * 90000);
          const { data: newStudent } = await supabase
            .from('student_registrations')
            .insert([{
              name: clerkName,
              fatherName: 'N/A',
              email: email,
              studentId: `DS-${randId}`,
              status: 'APPROVED',
              course: 'B.Tech',
              year: '1st Year',
              semester: '1st Sem',
              section: 'A',
              set: '1',
              phone: '0000000000',
              transactionId: `TXN-AUTO-${randId}`,
              paymentMode: 'ONLINE',
              github_username: user.username || null
            }])
            .select()
            .single();

          if (newStudent) {
            studentRecord = newStudent;
          }
        } catch (e) {
          console.error("Auto-registration error in middleware:", e);
        }
      }

      // Attach Clerk user and Student record (if exists)
      req.clerkUser = user;
      req.student = studentRecord;
      
      next();
    } catch (error) {
      console.error('verifyStudentJWT Error:', error);
      throw new ApiError(error.statusCode || 401, error?.message || 'Invalid access token');
    }
  })
];
