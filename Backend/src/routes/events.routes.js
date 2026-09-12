import { Router } from 'express';
import { getEvents, createEvent, deleteEvent, rsvpToEvent } from '../controllers/events.controller.js';

const router = Router();

router.route('/').get(getEvents).post(createEvent);
router.route('/:id').delete(deleteEvent);
router.route('/:id/rsvp').post(rsvpToEvent);

export default router;
