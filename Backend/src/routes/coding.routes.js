
import express from 'express';
import { getProblems, getProblemById } from '../controllers/coding.controller.js';

const router = express.Router();

router.get('/problems', getProblems);
router.get('/problems/:id', getProblemById);

export default router;
