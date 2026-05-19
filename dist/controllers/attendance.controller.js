"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceAnalytics = exports.markAttendance = exports.getAttendanceSheet = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAttendanceSheet = async (req, res) => {
    try {
        const { scheduleId, date, section } = req.query;
        if (!scheduleId || !date || !section) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        const schedule = await prisma.cRTSchedule.findUnique({
            where: { id: String(scheduleId) },
            include: { batches: true }
        });
        if (!schedule) {
            res.status(404).json({ error: "Schedule not found" });
            return;
        }
        // 1. Fetch Eligible Students
        let students = [];
        if (schedule.type === 'BATCH') {
            const batchIds = schedule.batches.map(b => b.id);
            students = await prisma.studentProfile.findMany({
                where: {
                    crt_batch_id: { in: batchIds },
                    is_deleted: false
                },
                include: { user: { select: { name: true, roll_no: true } } }, // Access user for name? No, name is on User, roll_no on StudentProfile
                orderBy: { roll_no: 'asc' }
            });
        }
        else if (schedule.type === 'BRANCH') {
            students = await prisma.studentProfile.findMany({
                where: {
                    branch: schedule.branch,
                    // year: parseYear(schedule.academic_year) // Optional: filter by year if needed
                    is_deleted: false,
                    // batch: schedule.academic_year // Assuming academic_year matches batch field in StudentProfile?
                },
                include: { user: { select: { name: true } } },
                orderBy: { roll_no: 'asc' }
            });
        }
        // 2. Fetch Existing Attendance
        const existingAttendance = await prisma.attendance.findMany({
            where: {
                schedule_id: String(scheduleId),
                date: new Date(String(date)),
                section: String(section)
            }
        });
        const attendanceMap = new Map(existingAttendance.map(a => [a.student_id, a]));
        // 3. Merge
        const sheet = students.map(s => {
            const record = attendanceMap.get(s.id);
            return {
                studentId: s.id,
                name: s.user?.name || "Unknown",
                rollNo: s.roll_no,
                status: record ? record.status : null, // null = Not Marked
                topic: record ? record.topic : null
            };
        });
        res.json({
            scheduleName: schedule.name,
            totalStudents: students.length,
            sheet
        });
    }
    catch (error) {
        console.error("Get attendance sheet error:", error);
        res.status(500).json({ error: "Failed to fetch attendance sheet" });
    }
};
exports.getAttendanceSheet = getAttendanceSheet;
const markAttendance = async (req, res) => {
    try {
        const { scheduleId, date, section, topic, records } = req.body;
        await prisma.$transaction(async (tx) => {
            for (const record of records) {
                // Upsert: Create if new, Update if exists
                // We use findFirst/update/create because key is composite but Prisma upsert needs generic unique input
                // Our schema has @@unique([student_id, schedule_id, date, section])
                const whereInput = {
                    student_id_schedule_id_date_section: {
                        student_id: record.studentId,
                        schedule_id: scheduleId,
                        date: new Date(date),
                        section: section
                    }
                };
                await tx.attendance.upsert({
                    where: whereInput,
                    update: {
                        status: record.status,
                        topic: topic,
                        marked_at: new Date()
                    },
                    create: {
                        student_id: record.studentId,
                        schedule_id: scheduleId,
                        date: new Date(date),
                        section: section,
                        status: record.status,
                        topic: topic,
                        present: record.status === 'PRESENT' // Legacy field support if needed, or remove from schema
                    }
                });
            }
        });
        res.json({ message: "Attendance marked successfully" });
    }
    catch (error) {
        console.error("Mark attendance error:", error);
        res.status(500).json({ error: "Failed to mark attendance" });
    }
};
exports.markAttendance = markAttendance;
const getAttendanceAnalytics = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        // Count Present/Absent
        const stats = await prisma.attendance.groupBy({
            by: ['status'],
            where: { schedule_id: scheduleId },
            _count: { id: true }
        });
        const summary = stats.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, {});
        res.json(summary);
    }
    catch (error) {
        console.error("Analytics error:", error);
        res.status(500).json({ error: "Failed to create analytics" });
    }
};
exports.getAttendanceAnalytics = getAttendanceAnalytics;
//# sourceMappingURL=attendance.controller.js.map