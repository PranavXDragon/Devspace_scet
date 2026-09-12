import { Router } from 'express';
import { getOpportunities, createOpportunity } from '../controllers/career.controller.js';

const router = Router();

router.get('/opportunities', getOpportunities);
// In a real app we'd secure this middleware for admin only
router.post('/opportunities', createOpportunity);

export default router;
