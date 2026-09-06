import { Router } from 'express';
import { 
    getAllQuestions, 
    getQuestionById, 
    createQuestion, 
    updateQuestion, 
    deleteQuestion 
} from '../controllers/question.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All question management routes require Admin JWT
router.use(verifyJWT);

router.route('/')
    .get(getAllQuestions)
    .post(createQuestion);

router.route('/:id')
    .get(getQuestionById)
    .put(updateQuestion)
    .delete(deleteQuestion);

export default router;
