import { Router } from 'express';
import { addTeamMember, getTeamMembers, deleteTeamMember, updateTeamMember } from '../controllers/team.controller.js';
import { verifyAdmin } from '../middlewares/adminAuth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Public route
router.route('/').get(getTeamMembers);

// Secured admin routes
router.use(verifyAdmin);

router.route('/').post(upload.single('photo'), addTeamMember);
router.route('/:id')
  .patch(upload.single('photo'), updateTeamMember)
  .delete(deleteTeamMember);

export default router;
