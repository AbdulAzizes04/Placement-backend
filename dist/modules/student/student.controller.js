"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const student_service_1 = require("./student.service");
const student_validation_1 = require("./student.validation");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const fileValidation_1 = require("../../utils/fileValidation");
const studentService = new student_service_1.StudentService();
const catchAsync_1 = require("../../utils/catchAsync");
class StudentController {
    constructor() {
        // Admin: Create Single Student (Auto-creates User)
        this.createStudent = (0, catchAsync_1.catchAsync)(async (req, res) => {
            // Use extended schema for full student creation (including User fields)
            const data = student_validation_1.createStudentSchema.parse(req.body);
            const collegeId = req.user.college_id;
            const result = await studentService.createStudentWithUser(collegeId, {
                ...data,
                status: data.status || 'Unplaced'
            });
            // Return the result directly as it now contains { user, profile, initialPassword }
            res.status(201).json(result);
        });
        // Self: Complete Profile (Legacy/User-driven)
        this.createProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const data = student_validation_1.createStudentProfileSchema.parse(req.body);
            const profile = await studentService.createProfile(req.user.id, req.user.college_id, data);
            res.status(201).json(profile);
        });
        this.bulkCreate = (0, catchAsync_1.catchAsync)(async (req, res) => {
            console.log("Incoming student sample:", req.body.students?.[0]);
            // Use strict schema from validation file
            const { students } = student_validation_1.bulkImportSchema.parse(req.body);
            const collegeId = req.user.college_id;
            if (!collegeId) {
                return res.status(400).json({ error: "College ID not found in session" });
            }
            console.log("Validation Passed. Processing...");
            // 🔒 Security Hardening: Sanitize CSV Data to prevent Formula Injection
            const sanitizedStudents = (0, fileValidation_1.sanitizeCSV)(students);
            const result = await studentService.bulkCreateStudents(sanitizedStudents, collegeId);
            // Result now includes createdCredentials array with plain text passwords
            res.json(result);
        });
        this.getProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const profile = await studentService.getProfile(req.user.id);
            res.json(profile);
        });
        this.updateProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const data = student_validation_1.updateStudentProfileSchema.parse(req.body);
            const profile = await studentService.updateProfile(req.user.id, data);
            res.json(profile);
        });
        this.getAllStudents = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const { page = 1, limit = 50, ...filters } = req.query;
            const collegeId = req.user.college_id;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 50;
            const queryFilters = {
                ...filters,
                college_id: collegeId,
            };
            if (queryFilters.is_crt !== undefined) {
                queryFilters.is_crt = queryFilters.is_crt === 'true';
            }
            if (queryFilters.min_cgpa) {
                queryFilters.cgpa = { gte: parseFloat(queryFilters.min_cgpa) };
                delete queryFilters.min_cgpa;
            }
            if (queryFilters.search) {
                queryFilters.user = {
                    name: { contains: queryFilters.search, mode: 'insensitive' }
                };
                delete queryFilters.search;
            }
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
                data: transformedStudents,
                meta
            });
        });
        this.deleteStudent = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const { id } = req.params;
            await studentService.deleteStudent(id);
            res.json({ message: "Student and related account deleted successfully" });
        });
        this.bulkDelete = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const { studentIds } = req.body;
            if (!Array.isArray(studentIds) || studentIds.length === 0) {
                return res.status(400).json({ error: "No student IDs provided" });
            }
            const result = await studentService.bulkDeleteStudents(studentIds);
            res.json({ message: "Bulk deletion successful", deletedCount: result.count });
        });
        this.deleteAllStudents = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const { password, batch_year } = req.body;
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
            // 2. Perform Delete All (filtered by batch_year if provided)
            const result = await studentService.deleteAllStudents(user.college_id, batch_year);
            console.log(`[Admin ${user.email}] Deleted students (Batch: ${batch_year || 'ALL'}). Count: ${result.count}`);
            res.json({ message: "Students deleted successfully", deletedCount: result.count });
        });
        this.getStatistics = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const collegeId = req.user.college_id;
            const filters = req.query;
            const stats = await studentService.getStatistics(collegeId, filters);
            res.json(stats);
        });
    }
}
exports.StudentController = StudentController;
//# sourceMappingURL=student.controller.js.map