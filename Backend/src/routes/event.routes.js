import { Router } from 'express';
import { createEvent, getEvents, deleteEvent, updateEvent } from '../controllers/event.controller.js';
import { verifyAdmin } from '../middlewares/adminAuth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Public route
router.route('/').get(getEvents);

// Secured admin routes
router.use(verifyAdmin);

router.route('/').post(upload.single('coverImage'), createEvent);
router.route('/:id')
  .patch(upload.single('coverImage'), updateEvent)
  .delete(deleteEvent);

export default router;
