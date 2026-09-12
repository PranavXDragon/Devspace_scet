import { Router } from 'express';
import { getGithubStats } from '../controllers/git.controller.js';

const router = Router();

router.route('/:username').get(getGithubStats);

export default router;
