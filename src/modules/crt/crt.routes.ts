import { Router } from 'express';
import { CRTController } from './crt.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { ROLES } from '../../config/constants';

const router = Router();
const crtController = new CRTController();

// Apply authentication to all CRT routes
router.use(authenticate);

const isTPOOrAdmin = authorize(ROLES.ADMIN, ROLES.TPO);

router.post('/batch', isTPOOrAdmin, crtController.createBatch);
router.get('/batch', crtController.getBatches); // Students can view batches? Assuming yes for now, or maybe restrict? Leaving as authenticated-only.
router.post('/preview', isTPOOrAdmin, crtController.previewBatch);
router.post('/allocate', isTPOOrAdmin, crtController.allocateBatch);
router.post('/import', isTPOOrAdmin, crtController.importStudents);

// Schedule Routes
router.post('/schedule', isTPOOrAdmin, crtController.createSchedule);
router.get('/schedule', crtController.getSchedules);
router.get('/schedule/faculty', crtController.getFacultySchedules);
router.get('/schedule/:id', crtController.getScheduleAnalytics);
router.delete('/schedule/:id', isTPOOrAdmin, crtController.deleteSchedule);
router.get('/schedule/:id/students', authorize(ROLES.ADMIN, ROLES.TPO, ROLES.STAFF), crtController.getScheduleStudents);
router.get('/schedule/:id/attendance', crtController.getAttendanceBySlot);

// Attendance Routes
// router.post('/schedule/:id/attendance', isTPOOrAdmin, crtController.markDailyAttendance); // Faculty might need this too.
// For now, restricting to Admin/TPO as per strict hardening. If faculty need access, we adds ROLES.FACULTY later.
router.post('/schedule/:id/attendance', authorize(ROLES.ADMIN, ROLES.TPO, ROLES.STAFF), crtController.markDailyAttendance);

router.get('/attendance/student', crtController.getMyAttendance);

export default router;