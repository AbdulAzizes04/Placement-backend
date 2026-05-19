"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const student_service_1 = require("./student.service");
const student_validation_1 = require("./student.validation");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const studentService = new student_service_1.StudentService();
class StudentController {
    // Admin: Create Single Student (Auto-creates User)
    async createStudent(req, res) {
        try {
            // Use extended schema for full student creation (including User fields)
            const data = student_validation_1.createStudentSchema.parse(req.body);
            const collegeId = req.user.college_id;
            const result = await studentService.createStudentWithUser(collegeId, {
                ...data,
                status: data.status || 'Unplaced'
            });
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // Self: Complete Profile (Legacy/User-driven)
    async createProfile(req, res) {
        try {
            const data = student_validation_1.createStudentProfileSchema.parse(req.body);
            // We need to pass valid CreateStudentDto-like or just specific profile data.
            // Since createProfile in service was removed/refactored, we might need to restore it OR use update if profile exists?
            // But this is "createProfile".
            // Assuming restore of createProfile in service.
            const profile = await studentService.createProfile(req.user.id, req.user.college_id, data);
            res.status(201).json(profile);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async bulkCreate(req, res) {
        try {
            console.log("Incoming student sample:", req.body.students?.[0]);
            // Use strict schema from validation file
            const { students } = student_validation_1.bulkImportSchema.parse(req.body);
            const collegeId = req.user.college_id;
            if (!collegeId) {
                return res.status(400).json({ error: "College ID not found in session" });
            }
            console.log("Validation Passed. Processing...");
            const result = await studentService.bulkCreateStudents(students, collegeId);
            res.json(result);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                console.error("Validation Failed:", JSON.stringify(error.errors, null, 2));
                return res.status(400).json({
                    error: "Validation Error",
                    details: error.errors.map(e => {
                        // Helper to get nested value safely
                        const val = e.path.reduce((acc, key) => acc?.[key], req.body);
                        return {
                            path: e.path.join('.'),
                            message: e.message,
                            received: val
                        };
                    })
                });
            }
            console.error("Bulk Import Error:", error);
            res.status(500).json({ error: error.message });
        }
    }
    async getProfile(req, res) {
        try {
            const profile = await studentService.getProfile(req.user.id);
            res.json(profile);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async updateProfile(req, res) {
        try {
            const data = student_validation_1.updateStudentProfileSchema.parse(req.body);
            const profile = await studentService.updateProfile(req.user.id, data);
            res.json(profile);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getAllStudents(req, res) {
        try {
            const { page = 1, limit = 50, ...filters } = req.query;
            const collegeId = req.user.college_id;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 50;
            const queryFilters = {
                ...filters,
                college_id: collegeId,
            };
            const result = await studentService.getAllStudents(queryFilters, pageNum, limitNum);
            const { students, meta } = result;
            const currentYear = new Date().getFullYear();
            const transformedStudents = students.map((s) => {
                let batch = s.batch;
                if (!batch) {
                    const batchStart = currentYear - (s.year || 1);
                    const batchEnd = batchStart + 4;
                    batch = `${batchStart}-${batchEnd}`;
                }
                const isPlaced = s.placement_records && s.placement_records.length > 0;
                const dbStatus = s.status;
                const finalStatus = isPlaced ? 'Placed' : (dbStatus || 'Unplaced');
                return {
                    id: s.user_id,
                    profileId: s.id,
                    rollNo: s.roll_no || "N/A",
                    name: s.user?.name || "Unknown",
                    branch: s.branch || "N/A",
                    year: s.year || 0,
                    batch: batch,
                    cgpa: s.cgpa || 0,
                    phone: s.user?.phone || null,
                    email: s.user?.email || "N/A",
                    status: finalStatus,
                    is_crt: s.is_crt || false
                };
            });
            res.json({
                students: transformedStudents,
                meta
            });
        }
        catch (error) {
            console.error("GET /students failed:", error);
            res.status(500).json({ error: error.message });
        }
    }
    async deleteStudent(req, res) {
        try {
            const { id } = req.params;
            await studentService.deleteStudent(id);
            res.json({ message: "Student and related account deleted successfully" });
        }
        catch (error) {
            const message = error.message;
            if (message.includes("Student profile not found")) {
                return res.status(404).json({ error: "Student not found" });
            }
            res.status(500).json({ error: message });
        }
    }
    async bulkDelete(req, res) {
        try {
            const { studentIds } = req.body;
            if (!Array.isArray(studentIds) || studentIds.length === 0) {
                return res.status(400).json({ error: "No student IDs provided" });
            }
            const result = await studentService.bulkDeleteStudents(studentIds);
            res.json({ message: "Bulk deletion successful", deletedCount: result.count });
        }
        catch (error) {
            const message = error.message;
            res.status(500).json({ error: message });
        }
    }
    async deleteAllStudents(req, res) {
        try {
            const { password } = req.body;
            const user = req.user;
            if (!password) {
                return res.status(400).json({ error: "Password is required" });
            }
            // 1. Verify Admin Password
            const adminUser = await prisma_1.default.user.findUnique({
                where: { id: user.id }
            });
            if (!adminUser || !(await bcryptjs_1.default.compare(password, adminUser.password))) {
                return res.status(401).json({ error: "Invalid password" });
            }
            // 2. Perform Delete All
            const result = await studentService.deleteAllStudents(user.college_id);
            console.log(`[Admin ${user.email}] Deleted all students. Count: ${result.count}`);
            res.json({ message: "All students deleted successfully", deletedCount: result.count });
        }
        catch (error) {
            console.error("Delete All Students Error:", error);
            res.status(500).json({ error: error.message });
        }
    }
    async getStatistics(req, res) {
        try {
            const collegeId = req.user.college_id;
            const filters = req.query;
            const stats = await studentService.getStatistics(collegeId, filters);
            res.json(stats);
        }
        catch (error) {
            console.error("GET /students/stats failed:", error);
            res.status(500).json({ error: error.message });
        }
    }
}
exports.StudentController = StudentController;
//# sourceMappingURL=student.controller.js.map