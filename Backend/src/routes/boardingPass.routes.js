import { Router } from 'express';
import { generateBulkBoardingPasses, verifyBoardingPass } from '../controllers/boardingPass.controller.js';
import { verifyAdmin } from '../middlewares/adminAuth.middleware.js';

const router = Router();

// Public route for verification
router.route('/verify/:boardingPassId').get(verifyBoardingPass);

// Secured admin route
router.route('/generate-bulk').post(verifyAdmin, generateBulkBoardingPasses);

export default router;
