import { Router } from 'express';
import { 
    getAllQuestions, 
    getQuestionById, 
    createQuestion, 
    updateQuestion, 
    deleteQuestion 
} from '../controllers/question.controller.js';
import { verifyAdmin } from '../middlewares/adminAuth.middleware.js';

const router = Router();

// All question management routes require Admin JWT
router.use(verifyAdmin);

router.route('/')
    .get(getAllQuestions)
    .post(createQuestion);

router.route('/:id')
    .get(getQuestionById)
    .put(updateQuestion)
    .delete(deleteQuestion);

export default router;
