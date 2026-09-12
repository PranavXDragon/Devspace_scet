import { Router } from 'express';
import { generateBulkCertificates, verifyCertificate, getLatestSignature } from '../controllers/certificate.controller.js';
import { verifyAdmin } from '../middlewares/adminAuth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Public route for verification
router.route('/verify/:certificateId').get(verifyCertificate);

// Secured admin route
router.route('/latest-signature').get(verifyAdmin, getLatestSignature);
router.route('/generate-bulk').post(verifyAdmin, upload.single('signatureImage'), generateBulkCertificates);

export default router;
