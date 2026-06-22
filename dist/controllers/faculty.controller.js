"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFaculty = exports.updateFaculty = exports.createFaculty = exports.getFacultyById = exports.getFacultyList = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// Get all faculty
const getFacultyList = async (req, res) => {
    try {
        const faculty = await prisma.facultyProfile.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(faculty);
    }
    catch (error) {
        console.error("Error fetching faculty:", error);
        res.status(500).json({ error: "Failed to fetch faculty list" });
    }
};
exports.getFacultyList = getFacultyList;
// Get single faculty with stats
const getFacultyById = async (req, res) => {
    try {
        const { id } = req.params;
        const { academic_year } = req.query; // Optional filter
        const faculty = await prisma.facultyProfile.findUnique({
            where: { id },
            include: { user: true }
        });
        if (!faculty) {
            return res.status(404).json({ error: "Faculty not found" });
        }
        // Aggregation Logic
        const branches = faculty.assignedBranches;
        const batchFilter = academic_year ? { batch: String(academic_year) } : {};
        // 1. Fetch Students
        const students = await prisma.studentProfile.findMany({
            where: {
                branch: { in: branches },
                ...batchFilter
            },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                placement_records: true // to check effective placement status if efficient, or rely on status field
            },
            orderBy: { roll_no: 'asc' }
        });
        // 2. Calculate Stats
        const totalStudents = students.length;
        const placedStudents = students.filter(s => s.status === 'Placed' || (s.placement_records && s.placement_records.length > 0)).length;
        // 3. Branch Breakdown
        const branchBreakdown = {};
        students.forEach(s => {
            branchBreakdown[s.branch] = (branchBreakdown[s.branch] || 0) + 1;
        });
        // 4. Batch Breakdown
        const batchBreakdown = {};
        students.forEach(s => {
            if (s.batch) {
                batchBreakdown[s.batch] = (batchBreakdown[s.batch] || 0) + 1;
            }
        });
        // 5. Map Students for Frontend
        const studentList = students.map(s => ({
            id: s.user_id, // Use user_id to match accessible student profile route
            name: s.user.name,
            email: s.user.email,
            rollNo: s.roll_no,
            branch: s.branch,
            batch: s.batch,
            status: (s.placement_records && s.placement_records.length > 0) ? 'Placed' : s.status
        }));
        res.json({
            ...faculty,
            assignedBatches: Object.keys(batchBreakdown),
            stats: {
                total_students: totalStudents,
                placed_students: placedStudents,
                branch_breakdown: branchBreakdown,
                batch_breakdown: batchBreakdown
            },
            students: studentList
        });
    }
    catch (error) {
        console.error("Error fetching faculty details:", error);
        res.status(500).json({ error: "Failed to fetch faculty details" });
    }
};
exports.getFacultyById = getFacultyById;
// Create Faculty
const createFaculty = async (req, res) => {
    try {
        const { name, email, phone, assignedBranches, password } = req.body;
        // Basic validation
        if (!name || !email || !password || !assignedBranches) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Transaction to create User + Profile
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create User
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    username: email, // Default username as email
                    password: hashedPassword,
                    phone,
                    role: 'STAFF', // Faculty = STAFF
                    college_id: req.user.college_id,
                    mustChangePassword: true
                }
            });
            // 2. Create Profile
            const profile = await tx.facultyProfile.create({
                data: {
                    user_id: user.id,
                    name,
                    email,
                    phone,
                    assignedBranches: Array.isArray(assignedBranches) ? assignedBranches : [assignedBranches],
                    assignedBatches: []
                }
            });
            return profile;
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Error creating faculty:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: "Failed to create faculty" });
    }
};
exports.createFaculty = createFaculty;
// Update Faculty
const updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, assignedBranches, assignedBatches } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        if (phone)
            updateData.phone = phone;
        if (assignedBranches)
            updateData.assignedBranches = assignedBranches;
        if (assignedBatches)
            updateData.assignedBatches = assignedBatches;
        const updated = await prisma.facultyProfile.update({
            where: { id },
            data: updateData
        });
        // Sync with User if name/email/phone changed
        if (name || email || phone) {
            await prisma.user.update({
                where: { id: updated.user_id },
                data: {
                    name: name || undefined,
                    email: email || undefined,
                    phone: phone || undefined
                }
            });
        }
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating faculty:", error);
        res.status(500).json({ error: "Failed to update faculty" });
    }
};
exports.updateFaculty = updateFaculty;
// Delete Faculty
const deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await prisma.facultyProfile.findUnique({ where: { id } });
        if (!profile)
            return res.status(404).json({ error: "Faculty not found" });
        await prisma.user.update({
            where: { id: profile.user_id },
            data: { is_deleted: true }
        });
        await prisma.facultyProfile.update({
            where: { id },
            data: { is_deleted: true }
        });
        res.json({ message: "Faculty deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting faculty:", error);
        res.status(500).json({ error: "Failed to delete faculty" });
    }
};
exports.deleteFaculty = deleteFaculty;
//# sourceMappingURL=faculty.controller.js.map