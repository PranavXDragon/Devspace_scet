import { Router } from 'express';
import {
  updateProfile,
  getCurrentAdmin,
  getDashboardMetrics,
  requestPasswordChange,
  changeAdminPassword,
  getSessions,
  killSession,
} from '../controllers/admin.controller.js';
import { verifyAdmin } from '../middlewares/adminAuth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { sendAnnouncement } from '../controllers/announcement.controller.js';
import { loginAdmin, verifyAdminOtp, logoutAdmin } from '../controllers/adminAuth.controller.js';

const router = Router();

// Authentication Routes
router.route('/login').post(loginAdmin);
router.route('/verify-otp').post(verifyAdminOtp);
router.route('/logout').post(logoutAdmin);

// Secured routes via Custom JWT (verifyAdmin)
router.route('/profile').patch(verifyAdmin, upload.single('profilePhoto'), updateProfile);
router.route('/update-profile').patch(verifyAdmin, updateProfile);
router.route('/avatar').patch(verifyAdmin, upload.single('profilePhoto'), updateProfile);

router.route('/current').get(verifyAdmin, getCurrentAdmin);
router.route('/dashboard').get(verifyAdmin, getDashboardMetrics);
router.route('/announcement').post(verifyAdmin, sendAnnouncement);

// Security & Password Management
router.route('/request-password-change').post(verifyAdmin, requestPasswordChange);
router.route('/change-password').post(verifyAdmin, changeAdminPassword);

// Active Session Management
router.route('/sessions').get(verifyAdmin, getSessions);
router.route('/sessions/:sessionId').delete(verifyAdmin, killSession);

export default router;
