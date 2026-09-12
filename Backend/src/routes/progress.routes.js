import { Router } from 'express';
import { getAnalytics, getAchievements } from '../controllers/progress.controller.js';

const router = Router();

router.get('/analytics', getAnalytics);
router.get('/achievements', getAchievements);

export default router;
