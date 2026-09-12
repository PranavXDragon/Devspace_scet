import { Router } from 'express';
import { createTeam, getMyTeam, joinTeam, getAllTeams } from '../controllers/teams.controller.js';

const router = Router();

router.route('/').get(getAllTeams).post(createTeam);
router.route('/:id/join').post(joinTeam);
router.route('/student/:studentId').get(getMyTeam);

export default router;
