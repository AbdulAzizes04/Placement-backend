"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crt_controller_1 = require("./crt.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
const crtController = new crt_controller_1.CRTController();
// Apply authentication to all CRT routes
router.use(auth_middleware_1.authenticate);
const isTPOOrAdmin = (0, role_middleware_1.authorize)(constants_1.ROLES.ADMIN, constants_1.ROLES.TPO);
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
router.get('/schedule/:id/students', (0, role_middleware_1.authorize)(constants_1.ROLES.ADMIN, constants_1.ROLES.TPO, constants_1.ROLES.STAFF), crtController.getScheduleStudents);
router.get('/schedule/:id/attendance', crtController.getAttendanceBySlot);
// Attendance Routes
// router.post('/schedule/:id/attendance', isTPOOrAdmin, crtController.markDailyAttendance); // Faculty might need this too.
// For now, restricting to Admin/TPO as per strict hardening. If faculty need access, we adds ROLES.FACULTY later.
router.post('/schedule/:id/attendance', (0, role_middleware_1.authorize)(constants_1.ROLES.ADMIN, constants_1.ROLES.TPO, constants_1.ROLES.STAFF), crtController.markDailyAttendance);
router.get('/attendance/student', crtController.getMyAttendance);
exports.default = router;
//# sourceMappingURL=crt.routes.js.map