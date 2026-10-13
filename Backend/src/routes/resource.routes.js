import { Router } from 'express';
import { 
    getAllResources, 
    getPublishedResources,
    getResourceById, 
    createResource, 
    updateResource, 
    deleteResource,
    uploadResourceFile
} from '../controllers/resource.controller.js';
import { verifyAdmin } from '../middlewares/adminAuth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Public/Student routes
router.route('/published').get(getPublishedResources);

// All other resource management routes require Admin JWT
router.use(verifyAdmin);

router.route('/upload-file').post(upload.single('file'), uploadResourceFile);

router.route('/')
    .get(getAllResources)
    .post(createResource);

router.route('/:id')
    .get(getResourceById)
    .put(updateResource)
    .delete(deleteResource);

export default router;
