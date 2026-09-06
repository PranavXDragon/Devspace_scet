import { Router } from 'express';
import { registerStudent } from '../controllers/student.controller.js';
import { loginStudent, verifyOtp, logoutStudent, getStudentDashboard } from '../controllers/studentAuth.controller.js';
import { verifyStudentJWT } from '../middlewares/studentAuth.middleware.js';

const router = Router();

// Public routes
router.route('/register').post(registerStudent);
router.route('/login').post(loginStudent);
router.route('/verify-otp').post(verifyOtp);
router.route('/logout').post(logoutStudent);

// Protected routes
router.route('/dashboard').get(verifyStudentJWT, getStudentDashboard);

export default router;
