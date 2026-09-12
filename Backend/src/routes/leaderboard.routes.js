import { Router } from 'express';
import { getLeaderboard, getStudentRank } from '../controllers/leaderboard.controller.js';

const router = Router();

router.route('/').get(getLeaderboard);
router.route('/rank/:studentId').get(getStudentRank);

export default router;
