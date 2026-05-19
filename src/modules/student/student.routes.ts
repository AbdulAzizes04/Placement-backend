import { Router } from 'express';
import { StudentController } from './student.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { ROLES } from '../../config/constants';

const router = Router();
const studentController = new StudentController();

// Protect all routes
router.use(authenticate);


const isTvAdmin = authorize(ROLES.ADMIN, ROLES.TPO);

router.post('/create', isTvAdmin, studentController.createStudent);
router.post('/bulk', isTvAdmin, studentController.bulkCreate);
router.post('/profile', studentController.createProfile);
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);
router.get('/stats', authorize(ROLES.ADMIN, ROLES.TPO, ROLES.STAFF), studentController.getStatistics);
router.get('/', authorize(ROLES.ADMIN, ROLES.TPO, ROLES.STAFF), studentController.getAllStudents);

router.delete('/bulk', authorize(ROLES.ADMIN), studentController.bulkDelete);

router.delete('/all', authorize(ROLES.ADMIN), studentController.deleteAllStudents);
router.delete('/:id', authorize(ROLES.ADMIN), studentController.deleteStudent);

export default router;