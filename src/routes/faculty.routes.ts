import { Router } from 'express';
import { getFacultyList, getFacultyById, createFaculty, updateFaculty, deleteFaculty } from '../controllers/faculty.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

// Define routes
router.use(authenticate); // Protect all routes

router.get('/', getFacultyList);
router.get('/:id', getFacultyById);
router.post('/', authorize('ADMIN'), createFaculty);
router.put('/:id', authorize('ADMIN', 'TPO'), updateFaculty);
router.delete('/:id', authorize('ADMIN'), deleteFaculty);

export default router;
