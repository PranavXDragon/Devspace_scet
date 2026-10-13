import { Router } from 'express';
import {
  getAllChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getAllContests,
  createContest,
  updateContest,
  deleteContest,
} from '../controllers/adminChallenges.controller.js';
import { verifyAdmin } from '../middlewares/adminAuth.middleware.js';

const router = Router();

// All routes require admin authentication
router.use(verifyAdmin);

// Challenges
router.route('/').get(getAllChallenges).post(createChallenge);
router.route('/:id').put(updateChallenge).delete(deleteChallenge);

// Contests
router.route('/contests').get(getAllContests).post(createContest);
router.route('/contests/:id').put(updateContest).delete(deleteContest);

export default router;
