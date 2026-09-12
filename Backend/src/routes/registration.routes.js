import { Router } from 'express';
import { getAllRegistrations, updateRegistrationStatus, addManualRegistration, bulkRegistration } from '../controllers/registration.controller.js';
import { verifyAdmin } from '../middlewares/adminAuth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Apply auth middleware to all routes in this file
router.use(verifyAdmin);

router.route('/').get(getAllRegistrations);
router.route('/manual').post(addManualRegistration);
router.route('/bulk').post(upload.single('file'), bulkRegistration);
router.route('/:id/status').patch(updateRegistrationStatus);

export default router;
