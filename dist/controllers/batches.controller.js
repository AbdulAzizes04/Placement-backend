"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBatchFromCSV = exports.unassignStudent = exports.exportBatch = exports.deleteAllBatches = exports.deleteBatch = exports.getBatchById = exports.getBranchStats = exports.getBatches = exports.allocateBatches = exports.checkAvailability = exports.importBatches = void 0;
const client_1 = require("@prisma/client");
const encryption_1 = require("../utils/encryption");
const prisma = new client_1.PrismaClient();
const student_service_1 = require("../modules/student/student.service");
const studentService = new student_service_1.StudentService();
// --- Import Batches (CSV) ---
const importBatches = async (req, res) => {
    try {
        const { students, academic_year } = req.body;
        const collegeId = req.user?.college_id;
        if (!collegeId) {
            res.status(400).json({ error: "College ID not found" });
            return;
        }
        if (!students || !Array.isArray(students)) {
            res.status(400).json({ error: "Invalid students data" });
            return;
        }
        const bulkData = students.map((s) => {
            // Helper to find value by case-insensitive key
            const getVal = (keys) => {
                const targetKey = Object.keys(s).find(k => keys.some(tk => k.trim().toLowerCase() === tk.toLowerCase()));
                return targetKey ? s[targetKey] : undefined;
            };
            const rollNo = getVal(["Roll No", "roll_no", "RollNo", "Roll Number", "Roll_No"]);
            const name = getVal(["Name", "Student Name", "name"]);
            const email = getVal(["Email", "Email ID", "EmailAddress", "email"]);
            const branch = getVal(["Branch", "Department", "branch"]);
            const cgpa = getVal(["CGPA", "GPA", "cgpa"]);
            const marks = getVal(["Marks", "CRT Marks", "marks"]);
            const batchCol = getVal(["Batch", "Academic Year", "Year", "batch"]);
            const batchStr = batchCol || academic_year || "2024-2028";
            // ... (rest of year logic remains same)
            let year = 1;
            try {
                const batchStart = parseInt(batchStr.split('-')[0]);
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth();
                const currentYear = currentDate.getFullYear();
                const academicYearStart = currentMonth < 6 ? currentYear - 1 : currentYear;
                year = Math.max(1, Math.min(4, academicYearStart - batchStart + 1));
            }
            catch (e) {
                year = 1;
            }
            return {
                roll_no: String(rollNo || "").trim(),
                name: String(name || "").trim(),
                email: String(email || "").trim(),
                branch: String(branch || "").trim(),
                batch: String(batchStr || "").trim(),
                cgpa: Number(cgpa || 0),
                year: year,
                crt_marks: Number(marks || 0),
                is_crt: true,
                status: 'Unplaced',
                skills: []
            };
        }).filter((s) => s.roll_no && s.name && s.branch);
        // Use bulkCreateStudents (Upsert) instead of bulkSyncStudents.
        // This allows re-populating the database after a Wipe All,
        // while still preventing duplicates by updating existing roll numbers.
        const results = await studentService.bulkCreateStudents(bulkData, collegeId);
        res.json({ message: "Import completed", ...results });
    }
    catch (error) {
        console.error("Import error:", error);
        res.status(500).json({ error: "Failed to import students" });
    }
};
exports.importBatches = importBatches;
// --- Check Availability (Preview) ---
const checkAvailability = async (req, res) => {
    try {
        const { min_marks, max_marks, academic_year } = req.body;
        const whereClause = {
            crt_batch_id: null, // Only unallocated
            is_deleted: false,
            is_crt: true,
            crt_marks: {
                gte: Number(min_marks) || 0,
                lte: Number(max_marks) || 100
            }
        };
        if (academic_year) {
            whereClause.batch = academic_year;
        }
        const stats = await prisma.studentProfile.groupBy({
            by: ['branch'],
            where: whereClause,
            _count: { id: true }
        });
        // Format: { CSE: 50, ECE: 30 }
        const formatted = stats.reduce((acc, curr) => {
            acc[curr.branch] = curr._count.id;
            return acc;
        }, {});
        res.json(formatted);
    }
    catch (error) {
        console.error("Check availability error:", error);
        res.status(500).json({ error: "Failed to check availability" });
    }
};
exports.checkAvailability = checkAvailability;
// --- Allocate Batches ---
const allocateBatches = async (req, res) => {
    try {
        const { batches } = req.body;
        if (!batches || batches.length === 0) {
            res.status(400).json({ error: "No batches provided" });
            return;
        }
        const results = [];
        await prisma.$transaction(async (tx) => {
            // Check existing names
            for (const batch of batches) {
                const existing = await tx.cRTBatch.findFirst({ where: { batch_name: batch.batch_name } });
                if (existing) {
                    throw new Error(`Batch name '${batch.batch_name}' already exists`);
                }
            }
            for (const batchData of batches) {
                // Create Batch with academic year
                const newBatch = await tx.cRTBatch.create({
                    data: {
                        batch_name: batchData.batch_name,
                        academic_year: batchData.academic_year || "2024-2025",
                        trainer_name: "TBD",
                        start_date: new Date(),
                    }
                });
                let totalAllocated = 0;
                const allocationDetails = {};
                for (const criteria of batchData.criteria) {
                    const { branch, count, min_marks, max_marks } = criteria;
                    // Students matching criteria AND year
                    const whereClause = {
                        branch: branch,
                        crt_marks: {
                            gte: min_marks,
                            lte: max_marks || 100
                        },
                        crt_batch_id: null,
                        is_deleted: false,
                        batch: batchData.academic_year // Important: locking to year
                    };
                    const eligibleStudents = await tx.studentProfile.findMany({
                        where: whereClause,
                        orderBy: { crt_marks: 'desc' },
                        take: count // Auto-handle overflow by just taking 'count'
                    });
                    if (eligibleStudents.length > 0) {
                        const studentIds = eligibleStudents.map(s => s.id);
                        // NOTE: updateMany does NOT support relation 'connect'.
                        // We must use scalar field 'crt_batch_id' for batch updates.
                        await tx.studentProfile.updateMany({
                            where: { id: { in: studentIds } },
                            data: {
                                crt_batch_id: newBatch.id,
                                allocated_batch: newBatch.batch_name
                            }
                        });
                        totalAllocated += eligibleStudents.length;
                        allocationDetails[branch] = eligibleStudents.length;
                    }
                }
                results.push({
                    batch_name: newBatch.batch_name,
                    allocated: totalAllocated,
                    details: allocationDetails
                });
            }
        });
        res.json({ message: "Allocation successful", results });
    }
    catch (error) {
        console.error("Allocation error:", error);
        res.status(500).json({ error: error.message || "Allocation failed" });
    }
};
exports.allocateBatches = allocateBatches;
// --- Get Batches ---
const getBatches = async (req, res) => {
    try {
        const { year, page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;
        const whereClause = { is_deleted: false };
        if (year) {
            whereClause.academic_year = String(year);
        }
        const [batches, total] = await Promise.all([
            prisma.cRTBatch.findMany({
                where: whereClause,
                include: {
                    _count: {
                        select: { students: true }
                    },
                    students: {
                        select: { branch: true, status: true }
                    }
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limitNum
            }),
            prisma.cRTBatch.count({ where: whereClause })
        ]);
        const response = batches.map(batch => {
            const branchCounts = {};
            let placedCount = 0;
            if (batch.students) {
                batch.students.forEach((s) => {
                    const branch = s.branch || 'Unknown';
                    branchCounts[branch] = (branchCounts[branch] || 0) + 1;
                    if (s.status === 'Placed') {
                        placedCount++;
                    }
                });
            }
            return {
                id: batch.id,
                batch_name: batch.batch_name,
                academic_year: batch.academic_year,
                total_students: batch._count.students,
                placed_students: placedCount,
                unplaced_students: batch._count.students - placedCount,
                branch_breakdown: branchCounts,
                start_date: batch.start_date,
                end_date: batch.end_date,
                created_at: batch.created_at
            };
        });
        res.json({
            batches: response,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error("Get batches error:", error);
        res.status(500).json({ error: "Failed to fetch batches" });
    }
};
exports.getBatches = getBatches;
// --- Get Branch Stats (Available) ---
// Kept for legacy support if needed, but checkAvailability is preferred
const getBranchStats = async (req, res) => {
    try {
        const stats = await prisma.studentProfile.groupBy({
            by: ['branch'],
            where: {
                crt_batch_id: null,
                is_deleted: false,
                is_crt: true
            },
            _count: { id: true }
        });
        const formatted = stats.reduce((acc, curr) => {
            acc[curr.branch] = curr._count.id;
            return acc;
        }, {});
        res.json(formatted);
    }
    catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};
exports.getBranchStats = getBranchStats;
// --- Get Batch Details ---
const getBatchById = async (req, res) => {
    try {
        const { id } = req.params;
        const batch = await prisma.cRTBatch.findUnique({
            where: { id },
            include: {
                _count: { select: { students: true } }
            }
        });
        if (!batch) {
            res.status(404).json({ error: "Batch not found" });
            return;
        }
        const students = await prisma.studentProfile.findMany({
            where: {
                crt_batch_id: id,
                is_deleted: false
            },
            include: {
                user: { select: { email: true, name: true, phone: true } }
            },
            orderBy: { roll_no: 'asc' }
        });
        const studentData = students.map(s => ({
            id: s.user_id,
            profileId: s.id,
            name: s.user?.name || "Unknown",
            roll_no: (0, encryption_1.decrypt)(s.roll_no),
            branch: s.branch,
            email: s.user?.email || "N/A",
            phone: s.user?.phone || "N/A",
            cgpa: s.cgpa,
            marks: s.crt_marks,
            status: s.status,
            batch_year: s.batch
        }));
        res.json({
            ...batch,
            total_students: batch._count.students,
            students: studentData
        });
    }
    catch (error) {
        console.error("Get batch details error:", error);
        res.status(500).json({ error: "Failed to fetch batch details" });
    }
};
exports.getBatchById = getBatchById;
// --- Delete Batch ---
const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.$transaction(async (tx) => {
            // 1. Unassign students using scalar updateMany
            await tx.studentProfile.updateMany({
                where: { crt_batch_id: id },
                data: {
                    crt_batch_id: null,
                    allocated_batch: null
                }
            });
            // 2. Delete batch
            await tx.cRTBatch.delete({
                where: { id }
            });
        });
        res.json({ message: "Batch deleted successfully" });
    }
    catch (error) {
        console.error("Delete batch error:", error);
        res.status(500).json({ error: "Failed to delete batch" });
    }
};
exports.deleteBatch = deleteBatch;
// --- Delete All Batches for a Year ---
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const deleteAllBatches = async (req, res) => {
    try {
        const { password, batch_year } = req.body;
        const user = req.user;
        if (!password) {
            res.status(400).json({ error: "Password is required" });
            return;
        }
        if (!batch_year) {
            res.status(400).json({ error: "Academic year is required" });
            return;
        }
        // 1. Verify Admin Password
        const adminUser = await prisma.user.findUnique({
            where: { id: user.id }
        });
        if (!adminUser || !(await bcryptjs_1.default.compare(password, adminUser.password))) {
            res.status(401).json({ error: "Invalid password" });
            return;
        }
        await prisma.$transaction(async (tx) => {
            // 1. Erase CRT module data and unassign all students in this year
            await tx.studentProfile.updateMany({
                where: { batch: batch_year },
                data: {
                    crt_batch_id: null,
                    allocated_batch: null,
                    is_crt: false,
                    crt_marks: null
                }
            });
            // 2. Find all batches for this year
            const batches = await tx.cRTBatch.findMany({
                where: { academic_year: batch_year }
            });
            const batchIds = batches.map(b => b.id);
            if (batchIds.length > 0) {
                // 3. Delete batches
                await tx.cRTBatch.deleteMany({
                    where: { id: { in: batchIds } }
                });
            }
        });
        res.json({ message: `All batches for ${batch_year} deleted successfully.` });
    }
    catch (error) {
        console.error("Delete all batches error:", error);
        res.status(500).json({ error: "Failed to delete all batches" });
    }
};
exports.deleteAllBatches = deleteAllBatches;
// --- Export Batch ---
const exportBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const batch = await prisma.cRTBatch.findUnique({
            where: { id },
            select: { batch_name: true, academic_year: true }
        });
        if (!batch) {
            res.status(404).json({ error: "Batch not found" });
            return;
        }
        const students = await prisma.studentProfile.findMany({
            where: {
                crt_batch_id: id,
                is_deleted: false
            },
            include: {
                user: { select: { email: true, name: true, phone: true } }
            },
            orderBy: { roll_no: 'asc' }
        });
        // Headers: name,roll_number,branch,batch_year,cgpa,email,marks,placement_status
        const data = students.map(s => ({
            name: s.user?.name || "Unknown",
            roll_number: s.roll_no,
            branch: s.branch,
            batch_year: s.batch, // Academic Year/Batch Year
            cgpa: s.cgpa,
            email: s.user?.email || "N/A",
            marks: s.crt_marks,
            placement_status: s.status
        }));
        res.json(data);
    }
    catch (error) {
        console.error("Export error:", error);
        res.status(500).json({ error: "Failed to export batch" });
    }
};
exports.exportBatch = exportBatch;
// --- Unassign Student from Batch ---
const unassignStudent = async (req, res) => {
    try {
        const { studentId } = req.body;
        if (!studentId) {
            res.status(400).json({ error: "Student ID is required" });
            return;
        }
        await prisma.studentProfile.update({
            where: { id: studentId },
            data: {
                crt_batch_id: null,
                allocated_batch: null
            }
        });
        res.json({ message: "Student unassigned successfully" });
    }
    catch (error) {
        console.error("Unassign error:", error);
        res.status(500).json({ error: "Failed to unassign student" });
    }
};
exports.unassignStudent = unassignStudent;
// --- Create Batch from CSV ---
const createBatchFromCSV = async (req, res) => {
    try {
        const { batch_name, academic_year, students } = req.body;
        const collegeId = req.user?.college_id;
        if (!collegeId) {
            res.status(400).json({ error: "College ID not found" });
            return;
        }
        if (!batch_name) {
            res.status(400).json({ error: "Batch name is required" });
            return;
        }
        if (!students || !Array.isArray(students) || students.length === 0) {
            res.status(400).json({ error: "Invalid students data" });
            return;
        }
        // 1. Check if batch name already exists
        const existingBatch = await prisma.cRTBatch.findFirst({
            where: { batch_name: batch_name }
        });
        if (existingBatch) {
            res.status(400).json({ error: `Batch name '${batch_name}' already exists` });
            return;
        }
        // 2. Prepare bulk data
        const bulkData = students.map((s) => {
            const getVal = (keys) => {
                const targetKey = Object.keys(s).find(k => keys.some(tk => k.trim().toLowerCase() === tk.toLowerCase()));
                return targetKey ? s[targetKey] : undefined;
            };
            const rollNo = getVal(["Roll No", "roll_no", "RollNo", "Roll Number", "Roll_No"]);
            const name = getVal(["Name", "Student Name", "name"]);
            const email = getVal(["Email", "Email ID", "EmailAddress", "email"]);
            const branch = getVal(["Branch", "Department", "branch"]);
            const cgpa = getVal(["CGPA", "GPA", "cgpa"]);
            const marks = getVal(["Marks", "CRT Marks", "marks"]);
            const batchCol = getVal(["Batch", "Academic Year", "Year", "batch"]);
            const batchStr = batchCol || academic_year || "2024-2028";
            let year = 1;
            try {
                const batchStart = parseInt(batchStr.split('-')[0]);
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth();
                const currentYear = currentDate.getFullYear();
                const academicYearStart = currentMonth < 6 ? currentYear - 1 : currentYear;
                year = Math.max(1, Math.min(4, academicYearStart - batchStart + 1));
            }
            catch (e) {
                year = 1;
            }
            return {
                roll_no: String(rollNo || "").trim(),
                name: String(name || "").trim(),
                email: String(email || "").trim(),
                branch: String(branch || "").trim(),
                batch: String(batchStr || "").trim(),
                cgpa: Number(cgpa || 0),
                year: year,
                crt_marks: Number(marks || 0),
                is_crt: true,
                status: 'Unplaced',
                skills: []
            };
        }).filter((s) => s.roll_no && s.name && s.branch);
        if (bulkData.length === 0) {
            res.status(400).json({ error: "No valid student data found in the provided list" });
            return;
        }
        // 3. Upsert students
        await studentService.bulkCreateStudents(bulkData, collegeId);
        // 4. Create Batch & allocate students
        await prisma.$transaction(async (tx) => {
            const newBatch = await tx.cRTBatch.create({
                data: {
                    batch_name: batch_name,
                    academic_year: academic_year || "2024-2025",
                    trainer_name: "TBD",
                    start_date: new Date(),
                }
            });
            // Find the upserted students to get their IDs using hashes
            const rollNoHashes = bulkData.map(s => (0, encryption_1.hash)(s.roll_no.toUpperCase()));
            const eligibleStudents = await tx.studentProfile.findMany({
                where: {
                    roll_no_hash: { in: rollNoHashes },
                    college_id: collegeId
                },
                select: { id: true }
            });
            if (eligibleStudents.length > 0) {
                const studentIds = eligibleStudents.map(s => s.id);
                await tx.studentProfile.updateMany({
                    where: { id: { in: studentIds } },
                    data: {
                        crt_batch_id: newBatch.id,
                        allocated_batch: newBatch.batch_name
                    }
                });
            }
        });
        res.json({ message: "Batch created successfully from CSV data" });
    }
    catch (error) {
        console.error("Create batch from CSV error:", error);
        res.status(500).json({ error: error.message || "Failed to create batch from CSV" });
    }
};
exports.createBatchFromCSV = createBatchFromCSV;
//# sourceMappingURL=batches.controller.js.map