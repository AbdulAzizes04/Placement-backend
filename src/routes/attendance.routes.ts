
import { Router } from 'express';
import { getAttendanceSheet, markAttendance, getAttendanceAnalytics } from '../controllers/attendance.controller';

const router = Router();

// Query params: ?scheduleId=...&date=...&section=...
router.get('/sheet', getAttendanceSheet);
router.post('/mark', markAttendance);
router.get('/analytics/:scheduleId', getAttendanceAnalytics);

export default router;
