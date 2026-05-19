"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = require("../controllers/attendance.controller");
const router = (0, express_1.Router)();
// Query params: ?scheduleId=...&date=...&section=...
router.get('/sheet', attendance_controller_1.getAttendanceSheet);
router.post('/mark', attendance_controller_1.markAttendance);
router.get('/analytics/:scheduleId', attendance_controller_1.getAttendanceAnalytics);
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map