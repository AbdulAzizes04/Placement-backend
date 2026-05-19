"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRTController = void 0;
const crt_service_1 = require("./crt.service");
const student_service_1 = require("../student/student.service");
const cache_service_1 = require("../../services/cache.service");
const crtService = new crt_service_1.CRTService();
const studentService = new student_service_1.StudentService();
class CRTController {
    async createBatch(req, res) {
        try {
            const data = req.body;
            const batch = await crtService.createBatch(data);
            res.status(201).json(batch);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getBatches(req, res) {
        try {
            const user = req.user;
            let studentId = undefined;
            if (user && user.role === 'STUDENT') {
                const profile = await studentService.getProfile(user.id);
                if (!profile || !profile.is_crt) {
                    // Non-CRT students see NO batches
                    return res.json([]);
                }
                studentId = profile.id;
            }
            const batches = await crtService.getBatches(studentId);
            res.json(batches);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async markAttendance(req, res) {
        try {
            const data = req.body;
            const attendance = await crtService.markAttendance(data);
            res.status(201).json(attendance);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // Legacy method removed.
    // --- Batch Allocation ---
    async previewBatch(req, res) {
        try {
            const { minMarks, maxMarks } = req.body;
            const stats = await crtService.previewBatch(Number(minMarks), Number(maxMarks));
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async allocateBatch(req, res) {
        try {
            const { batchName, totalStrength, allocations, minMarks, maxMarks } = req.body;
            // Basic validation
            const allocatedSum = Object.values(allocations).reduce((a, b) => a + b, 0);
            if (allocatedSum !== Number(totalStrength)) {
                return res.status(400).json({ error: `Allocation sum (${allocatedSum}) does not match total strength (${totalStrength})` });
            }
            const result = await crtService.allocateBatch(batchName, Number(totalStrength), allocations, Number(minMarks), Number(maxMarks));
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async importStudents(req, res) {
        try {
            const { students } = req.body; // Expecting array of { roll_no, marks }
            const result = await crtService.importStudentMarks(students);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // --- Schedule & Attendance ---
    async createSchedule(req, res) {
        try {
            // Expecting entire object in body
            const schedule = await crtService.createSchedule(req.body);
            res.status(201).json(schedule);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getSchedules(req, res) {
        try {
            const { academic_year, type, page = 1, limit = 20 } = req.query;
            const user = req.user;
            let studentProfile = undefined;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 20;
            if (user && user.role === 'STUDENT') {
                studentProfile = await studentService.getProfile(user.id);
                if (!studentProfile || !studentProfile.is_crt) {
                    return res.json({ schedules: [], meta: { total: 0, page: pageNum, limit: limitNum, totalPages: 0 } });
                }
            }
            const result = await crtService.getSchedules({
                academic_year: academic_year,
                type: type,
                studentId: studentProfile?.id,
                branch: studentProfile?.branch
            }, pageNum, limitNum);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getFacultySchedules(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const result = await crtService.getFacultySchedules(userId, pageNum, limitNum);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getScheduleStudents(req, res) {
        try {
            const students = await crtService.getScheduleStudents(req.params.id);
            res.json(students);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async markDailyAttendance(req, res) {
        try {
            const { date, section, topic, records } = req.body;
            const result = await crtService.markDailyAttendance(req.params.id, date, section, topic, records);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getScheduleAnalytics(req, res) {
        try {
            const cacheKey = `schedule_analytics:${req.params.id}`;
            const cached = cache_service_1.analyticsCache.get(cacheKey);
            if (cached)
                return res.json(cached);
            const analytics = await crtService.getScheduleAnalytics(req.params.id);
            cache_service_1.analyticsCache.set(cacheKey, analytics, 60); // Cache for 1 minute
            res.json(analytics);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getAttendanceBySlot(req, res) {
        try {
            const { id } = req.params;
            const { date, section } = req.query;
            if (!date || !section) {
                return res.status(400).json({ error: "Date and section are required" });
            }
            const result = await crtService.getAttendanceBySlot(id, date, section);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getMyAttendance(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'STUDENT') {
                return res.status(403).json({ error: "Only students can access their attendance" });
            }
            const profile = await studentService.getProfile(user.id);
            if (!profile) {
                return res.status(404).json({ error: "Student profile not found" });
            }
            const attendance = await crtService.getStudentAttendance(profile.id);
            res.json(attendance);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.CRTController = CRTController;
//# sourceMappingURL=crt.controller.js.map