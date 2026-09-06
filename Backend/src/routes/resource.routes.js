import { Router } from 'express';
import { 
    getAllResources, 
    getPublishedResources,
    getResourceById, 
    createResource, 
    updateResource, 
    deleteResource 
} from '../controllers/resource.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Public/Student routes
// Optionally, you might want to protect this with a student auth middleware later
router.route('/published').get(getPublishedResources);

// All other resource management routes require Admin JWT
router.use(verifyJWT);

router.route('/')
    .get(getAllResources)
    .post(createResource);

router.route('/:id')
    .get(getResourceById)
    .put(updateResource)
    .delete(deleteResource);

export default router;
