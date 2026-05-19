"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crt_controller_1 = require("./crt.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const crtController = new crt_controller_1.CRTController();
// Apply authentication to all CRT routes
router.use(auth_middleware_1.authenticate);
router.post('/batch', crtController.createBatch);
router.get('/batch', crtController.getBatches);
router.post('/preview', crtController.previewBatch);
router.post('/allocate', crtController.allocateBatch);
router.post('/import', crtController.importStudents);
// Schedule Routes
router.post('/schedule', crtController.createSchedule);
router.get('/schedule', crtController.getSchedules);
router.get('/schedule/faculty', crtController.getFacultySchedules); // Should be before :id to avoid conflict if logic wasn't precise, but here clear.
router.get('/schedule/:id', crtController.getScheduleAnalytics); // View Details
router.get('/schedule/:id/students', crtController.getScheduleStudents);
router.get('/schedule/:id/attendance', crtController.getAttendanceBySlot);
// Attendance Routes
router.post('/schedule/:id/attendance', crtController.markDailyAttendance);
router.get('/attendance/student', crtController.getMyAttendance);
exports.default = router;
//# sourceMappingURL=crt.routes.js.map