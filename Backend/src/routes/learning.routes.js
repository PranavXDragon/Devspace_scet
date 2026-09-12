import { Router } from 'express';
import { getRoadmaps, getCourseDetails, getMyProgress, markLessonComplete } from '../controllers/learning.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Publicly visible or student visible (We'll use Clerk auth to protect progress routes)
router.route('/roadmaps').get(getRoadmaps);
router.route('/courses/:courseId').get(getCourseDetails);

// Protected routes for tracking progress
router.use(verifyJWT);
router.route('/progress').get(getMyProgress).post(markLessonComplete);

export default router;
