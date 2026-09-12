import { Router } from 'express';
import { getPublicProjects, getMyProjects, createProject, updateProjectVisibility } from '../controllers/projects.controller.js';

const router = Router();

router.route('/').get(getPublicProjects).post(createProject);
router.route('/student/:studentId').get(getMyProjects);
router.route('/:id/visibility').patch(updateProjectVisibility);

export default router;
