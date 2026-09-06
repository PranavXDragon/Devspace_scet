import { Router } from 'express';
import { updateProfile, getCurrentAdmin, getDashboardMetrics } from '../controllers/admin.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { sendAnnouncement } from '../controllers/announcement.controller.js';

const router = Router();

// Secured routes via Clerk
router.route('/profile').patch(verifyJWT, upload.single('profilePhoto'), updateProfile);
router.route("/current").get(verifyJWT, getCurrentAdmin);
router.route("/dashboard").get(verifyJWT, getDashboardMetrics);
router.route("/announcement").post(verifyJWT, sendAnnouncement);

export default router;
