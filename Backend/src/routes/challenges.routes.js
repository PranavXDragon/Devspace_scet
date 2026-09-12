import { Router } from 'express';
import { getActiveChallenges, getChallengeDetails, submitChallenge } from '../controllers/challenges.controller.js';
import { getContests, getContestDetails } from '../controllers/contests.controller.js';

const router = Router();

// Challenges
router.route('/').get(getActiveChallenges);
router.route('/:id').get(getChallengeDetails);
router.route('/:id/submit').post(submitChallenge);

// Contests
router.route('/contests/list').get(getContests);
router.route('/contests/:id').get(getContestDetails);

export default router;
