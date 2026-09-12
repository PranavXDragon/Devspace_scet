import { Router } from 'express';
import { 
  createRoadmap, updateRoadmap, deleteRoadmap,
  createCourse, updateCourse, deleteCourse,
  createLesson, updateLesson, deleteLesson
} from '../controllers/adminLearning.controller.js';
import { verifyAdmin } from '../middlewares/adminAuth.middleware.js';

const router = Router();

// All routes require admin authentication
router.use(verifyAdmin);

// Roadmaps
router.route('/roadmaps').post(createRoadmap);
router.route('/roadmaps/:id').put(updateRoadmap).delete(deleteRoadmap);

// Courses
router.route('/courses').post(createCourse);
router.route('/courses/:id').put(updateCourse).delete(deleteCourse);

// Lessons
router.route('/lessons').post(createLesson);
router.route('/lessons/:id').put(updateLesson).delete(deleteLesson);

export default router;
