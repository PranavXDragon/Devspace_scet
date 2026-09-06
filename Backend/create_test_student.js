import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createTestStudent() {
  const student = {
    name: 'Test Student',
    fatherName: 'Test Father',
    course: 'B.Tech',
    year: '3rd Year',
    semester: '6th Sem',
    section: 'A',
    set: '1',
    studentId: 'TEST-12345',
    email: 'teststudent@devspace.com',
    phone: '1234567890',
    transactionId: 'TXN-TEST-999',
    status: 'PENDING'
  };

  const { data, error } = await supabase
    .from('student_registrations')
    .insert([student])
    .select();

  if (error) {
    console.error('Error creating test student:', error);
  } else {
    console.log('Test student created successfully:', data);
  }
}

createTestStudent();
