import { Router } from 'express';
import { registerStudent } from '../controllers/student.controller.js';
import { getStudentDashboard, updateGithubUsername } from '../controllers/studentAuth.controller.js';
import { verifyStudentJWT } from '../middlewares/studentAuth.middleware.js';

const router = Router();

// Public routes (We keep registerStudent if they still need to apply/register initially)
router.route('/register').post(registerStudent);

// Protected routes (Handled by Clerk middleware internally)
router.route('/dashboard').get(verifyStudentJWT, getStudentDashboard);
router.route('/github').patch(verifyStudentJWT, updateGithubUsername);

export default router;
