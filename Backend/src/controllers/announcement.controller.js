import { supabase } from '../config/supabase.js';
import { sendEmail } from '../utils/sendEmail.js';
import { announcementEmail } from '../utils/emailTemplates.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const sendAnnouncement = asyncHandler(async (req, res) => {
  const { targetAudience, subject, message, filters } = req.body;

  if (!targetAudience || !subject || !message) {
    throw new ApiError(400, 'Target audience, subject, and message are required');
  }

  let emailList = [];

  if (targetAudience === 'team') {
    let query = supabase.from('team_members').select('email');
    if (filters?.academicYear) query = query.eq('academicYear', filters.academicYear);
    if (filters?.subTeam) query = query.eq('subTeam', filters.subTeam);

    const { data: members, error } = await query;
    if (error) throw new ApiError(500, error.message);
    
    emailList = (members || []).map((m) => m.email).filter(Boolean);
  } else if (targetAudience === 'students') {
    let query = supabase.from('student_registrations').select('email');
    
    if (filters?.academicYear) {
      const [startYear] = filters.academicYear.split("-");
      const startDate = new Date(`${startYear}-06-01T00:00:00.000Z`).toISOString();
      const endDate = new Date(`${parseInt(startYear) + 1}-06-01T00:00:00.000Z`).toISOString();
      query = query.gte('created_at', startDate).lt('created_at', endDate);
    }
    if (filters?.year) query = query.eq('year', filters.year);
    if (filters?.course) query = query.eq('course', filters.course);
    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.eq('status', 'APPROVED');
    }

    const { data: students, error } = await query;
    if (error) throw new ApiError(500, error.message);

    emailList = (students || []).map((s) => s.email).filter(Boolean);
  } else {
    throw new ApiError(400, 'Invalid target audience');
  }

  // Remove duplicates
  emailList = [...new Set(emailList)];

  if (emailList.length === 0) {
    return res.status(200).json(new ApiResponse(200, null, 'No recipients found matching the filters.'));
  }

  const emailTemplate = announcementEmail(subject, message);

  // Send the bulk email
  await sendEmail({
    email: process.env.FROM_EMAIL,
    bcc: emailList,               
    subject,
    message: emailTemplate.html,
    textMessage: emailTemplate.text,
  });

  return res.status(200).json(
    new ApiResponse(200, { recipientCount: emailList.length }, `Announcement sent successfully to ${emailList.length} recipients.`)
  );
});

export { sendAnnouncement };
