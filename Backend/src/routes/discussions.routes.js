import { Router } from 'express';
import { 
    getDiscussions, getDiscussionById, createDiscussion, updateDiscussion, deleteDiscussion,
    createReply, updateReply, deleteReply
} from '../controllers/discussions.controller.js';

const router = Router();

router.route('/').get(getDiscussions).post(createDiscussion);
router.route('/:id').get(getDiscussionById).patch(updateDiscussion).delete(deleteDiscussion);

// Replies
router.route('/:id/replies').post(createReply);
router.route('/replies/:replyId').patch(updateReply).delete(deleteReply);

export default router;
