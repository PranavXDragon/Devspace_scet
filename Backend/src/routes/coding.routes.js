
import express from 'express';
import { getProblems, getProblemById, submitProblemSolution } from '../controllers/coding.controller.js';

const router = express.Router();

router.get('/problems', getProblems);
router.get('/problems/:id', getProblemById);
router.post('/problems/:id/submit', submitProblemSolution);

export default router;
