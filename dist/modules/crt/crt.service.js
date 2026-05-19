"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRTService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class CRTService {
    async createBatch(data) {
        return await prisma_1.default.cRTBatch.create({
            data,
        });
    }
    async getBatches(studentId) {
        return await prisma_1.default.cRTBatch.findMany({
            where: {
                is_deleted: false,
                students: studentId ? { some: { id: studentId } } : undefined
            },
        });
    }
    async markAttendance(data) {
        return await prisma_1.default.attendance.create({
            data,
        });
    }
    // Legacy method removed. Use getScheduleAnalytics or specific query.
    // --- Batch Allocation System ---
    async previewBatch(minMarks, maxMarks) {
        const students = await prisma_1.default.studentProfile.groupBy({
            by: ['branch'],
            where: {
                crt_batch_id: null, // Unallocated only
                crt_marks: {
                    gte: minMarks,
                    lte: maxMarks
                },
                is_deleted: false,
                // Ensure only active/eligible students are counted if needed
            },
            _count: {
                _all: true
            }
        });
        // Transform to friendly format: { CSE: 50, ECE: 30 }
        const result = {};
        students.forEach(s => {
            result[s.branch] = s._count._all;
        });
        // Also get total count
        const totalEligible = students.reduce((acc, curr) => acc + curr._count._all, 0);
        return { branches: result, total: totalEligible };
    }
    async allocateBatch(batchName, totalStrength, allocations, // { CSE: 10, ECE: 5 }
    minMarks, maxMarks) {
        return await prisma_1.default.$transaction(async (tx) => {
            // 1. Create Batch
            // Note: CRTBatch model requires trainer_name and dates. 
            // We might need to make them optional or provide defaults if not in UI.
            // Assuming for now they are provided or we use placeholders.
            const batch = await tx.cRTBatch.create({
                data: {
                    batch_name: batchName,
                    trainer_name: 'TBD', // Default if not provided
                    start_date: new Date(), // Default to now
                    // total_strength: totalStrength, // If schema had this field
                }
            });
            let totalAllocated = 0;
            // 2. Allocate per branch
            for (const [branch, count] of Object.entries(allocations)) {
                if (count <= 0)
                    continue;
                // Find Top X eligible students
                const eligibleStudents = await tx.studentProfile.findMany({
                    where: {
                        branch: branch,
                        crt_batch_id: null,
                        crt_marks: {
                            gte: minMarks,
                            lte: maxMarks
                        },
                        is_deleted: false
                    },
                    orderBy: {
                        crt_marks: 'desc'
                    },
                    take: count,
                    select: { id: true }
                });
                if (eligibleStudents.length < count) {
                    throw new Error(`Insufficient eligible students in ${branch}. Requested ${count}, found ${eligibleStudents.length}.`);
                }
                const studentIds = eligibleStudents.map(s => s.id);
                // Update students
                await tx.studentProfile.updateMany({
                    where: {
                        id: { in: studentIds }
                    },
                    data: {
                        crt_batch_id: batch.id,
                        is_crt: true // Mark as CRT student
                    }
                });
                totalAllocated += studentIds.length;
            }
            if (totalAllocated !== totalStrength) {
                // Optional: strict check. 
                // User asked "sum(allocated) = total_batch_strength" as input validation, 
                // effectively guiding the allocation. 
            }
            return { batch, allocatedCount: totalAllocated };
        });
    }
    async importStudentMarks(students) {
        // Bulk upsert is tricky in Prisma standardized way without loop, 
        // but for marks update we can iterate. 
        // Optimally, use `updateMany` if just updating, or loop `upsert`.
        const results = { success: 0, failed: 0, errors: [] };
        for (const student of students) {
            try {
                await prisma_1.default.studentProfile.update({
                    where: { roll_no: student.roll_no },
                    data: {
                        crt_marks: parseFloat(student.marks),
                        // Update other fields if needed
                    }
                });
                results.success++;
            }
            catch (error) {
                results.failed++;
                results.errors.push({ roll_no: student.roll_no, error: error.message });
            }
        }
        return results;
    }
    // --- Schedule & Attendance Module ---
    async createSchedule(data) {
        const { type, academic_year, name, start_date, end_date, room_no, branch, batch_ids, faculty_ids } = data;
        // Validate dates
        const start = new Date(start_date);
        const end = new Date(end_date);
        // Force end date to 23:59:59
        end.setHours(23, 59, 59, 999);
        if (start > end) {
            throw new Error("Start date cannot be after end date");
        }
        // Prepare relation connections
        const batchConnect = batch_ids?.map(id => ({ id })) || [];
        const facultyConnect = faculty_ids.map(id => ({ id }));
        return await prisma_1.default.cRTSchedule.create({
            data: {
                type: type,
                academic_year,
                name,
                start_date: start,
                end_date: end,
                room_no,
                branch: type === 'BRANCH' ? branch : null,
                batches: {
                    connect: batchConnect
                },
                faculty: {
                    connect: facultyConnect
                },
                status: "Active"
            },
            include: {
                batches: true,
                faculty: true
            }
        });
    }
    async getSchedules(filters, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const whereClause = {
            academic_year: filters.academic_year,
            type: filters.type ? filters.type : undefined,
            is_deleted: false
        };
        if (filters.studentId) {
            whereClause.OR = [
                { batches: { some: { students: { some: { id: filters.studentId } } } } },
                { type: 'BRANCH', branch: filters.branch }
            ];
        }
        const [schedules, total] = await Promise.all([
            prisma_1.default.cRTSchedule.findMany({
                where: whereClause,
                include: {
                    batches: true,
                    faculty: true,
                    _count: { select: { attendances: true } }
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            }),
            prisma_1.default.cRTSchedule.count({ where: whereClause })
        ]);
        return {
            schedules,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getFacultySchedules(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const facultyProfile = await prisma_1.default.facultyProfile.findUnique({
            where: { user_id: userId }
        });
        if (!facultyProfile)
            throw new Error("Faculty profile not found");
        const whereClause = {
            faculty: {
                some: { id: facultyProfile.id }
            },
            is_deleted: false
        };
        const [schedules, total] = await Promise.all([
            prisma_1.default.cRTSchedule.findMany({
                where: whereClause,
                include: {
                    batches: true,
                    _count: { select: { attendances: true } }
                },
                orderBy: { start_date: 'desc' },
                skip,
                take: limit
            }),
            prisma_1.default.cRTSchedule.count({ where: whereClause })
        ]);
        const schedulesWithStats = await Promise.all(schedules.map(async (s) => {
            const stats = await this.calculateScheduleProgress(s);
            return { ...s, ...stats };
        }));
        return {
            schedules: schedulesWithStats,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async calculateScheduleProgress(schedule) {
        const start = new Date(schedule.start_date);
        const end = new Date(schedule.end_date);
        // Calculate number of days
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        // Assuming 2 sessions per day (MORNING, AFTERNOON)
        const totalSessions = diffDays * 2;
        // Get number of sessions already marked (unique date + section)
        const markedSessions = await prisma_1.default.attendance.groupBy({
            by: ['date', 'section'],
            where: {
                schedule_id: schedule.id,
                is_deleted: false
            }
        });
        return {
            totalSessions,
            markedSessions: markedSessions.length,
            isPending: markedSessions.length < totalSessions
        };
    }
    async getScheduleStudents(scheduleId) {
        const schedule = await prisma_1.default.cRTSchedule.findUnique({
            where: { id: scheduleId },
            include: { batches: { include: { students: { include: { user: true } } } } }
        });
        if (!schedule)
            throw new Error("Schedule not found");
        let students = [];
        if (schedule.type === 'BATCH') {
            // Aggregate students from all linked batches
            schedule.batches.forEach(batch => {
                students = [...students, ...batch.students];
            });
        }
        else if (schedule.type === 'BRANCH' && schedule.branch) {
            // Fetch students from branch matching academic year
            // Assuming academic_year format "2022-2026", we might need logic to map to 'year' (1,2,3,4) 
            // or just filter by batch string if stored in student profile.
            // For now, let's assume we filter by branch and the implicit year logic (or fetch all for branch)
            // A better approach: Filter students where batch == academic_year
            students = await prisma_1.default.studentProfile.findMany({
                where: {
                    branch: schedule.branch,
                    batch: schedule.academic_year, // Assuming student.batch stores "2022-2026"
                    is_crt: true, // ONLY CRT registered students
                    is_deleted: false
                },
                include: { user: true }
            });
        }
        // Remove duplicates if any
        const uniqueStudents = Array.from(new Map(students.map(s => [s.id, s])).values());
        // Sort by roll number
        return uniqueStudents.sort((a, b) => a.roll_no.localeCompare(b.roll_no));
    }
    async markDailyAttendance(scheduleId, date, section, topic, records) {
        const schedule = await prisma_1.default.cRTSchedule.findUnique({ where: { id: scheduleId } });
        if (!schedule)
            throw new Error("Schedule not found");
        if (schedule.attendance_completed) {
            throw new Error("Attendance for this schedule is already marked as completed and locked.");
        }
        // Validation
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0); // Normalize to midnight
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (attendanceDate > today) {
            throw new Error("Cannot mark attendance for future dates");
        }
        const start = new Date(schedule.start_date);
        const end = new Date(schedule.end_date);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        if (attendanceDate < start || attendanceDate > end) {
            throw new Error("Attendance date is outside schedule duration");
        }
        // Transactional bulk upsert
        return await prisma_1.default.$transaction(async (tx) => {
            const results = [];
            for (const record of records) {
                // Upsert attendance
                const att = await tx.attendance.upsert({
                    where: {
                        student_id_schedule_id_date_section: {
                            student_id: record.student_id,
                            schedule_id: scheduleId,
                            date: attendanceDate,
                            section: section
                        }
                    },
                    update: {
                        status: record.status,
                        topic: topic,
                        updated_at: new Date()
                    },
                    create: {
                        student_id: record.student_id,
                        schedule_id: scheduleId,
                        date: attendanceDate,
                        section: section,
                        status: record.status,
                        topic: topic
                    }
                });
                results.push(att);
            }
            // After marking, check if schedule is now complete
            const progress = await this.calculateScheduleProgress(schedule);
            if (!progress.isPending) {
                await tx.cRTSchedule.update({
                    where: { id: scheduleId },
                    data: {
                        attendance_completed: true,
                        attendance_completed_at: new Date()
                    }
                });
            }
            return results;
        });
    }
    async getScheduleAnalytics(scheduleId) {
        const schedule = await prisma_1.default.cRTSchedule.findUnique({
            where: { id: scheduleId },
            include: {
                batches: true,
                faculty: true
            }
        });
        if (!schedule)
            throw new Error("Schedule not found");
        // Get Student Details (Reuse logic or simplified fetch)
        let students = [];
        if (schedule.type === 'BATCH') {
            const batches = await prisma_1.default.cRTBatch.findMany({
                where: { id: { in: schedule.batches.map(b => b.id) } },
                include: { students: { include: { user: true } } }
            });
            batches.forEach(b => students.push(...b.students));
        }
        else if (schedule.branch) {
            students = await prisma_1.default.studentProfile.findMany({
                where: { branch: schedule.branch, batch: schedule.academic_year, is_deleted: false },
                include: { user: true }
            });
        }
        // De-duplicate
        students = Array.from(new Map(students.map(s => [s.id, s])).values());
        // Get all attendance records
        const attendance = await prisma_1.default.attendance.findMany({
            where: { schedule_id: scheduleId },
            orderBy: { date: 'asc' }
        });
        // Calculate Classes Count (Unique Date + Section)
        const uniqueClasses = new Set(attendance.map(a => `${a.date.toISOString().split('T')[0]}-${a.section}`));
        const totalClasses = uniqueClasses.size;
        // Calculate Stats
        const totalPresent = attendance.filter(a => a.status === 'PRESENT').length;
        const totalAbsent = attendance.filter(a => a.status === 'ABSENT').length;
        const progress = await this.calculateScheduleProgress(schedule);
        return {
            schedule: {
                ...schedule,
                ...progress
            },
            students: students.map(s => ({
                id: s.id,
                roll_no: s.roll_no,
                name: s.user.name,
                branch: s.branch
            })),
            attendance,
            stats: {
                totalClasses,
                totalPresent,
                totalAbsent,
                presentPercentage: (totalPresent + totalAbsent) ? (totalPresent / (totalPresent + totalAbsent)) * 100 : 0,
                ...progress
            }
        };
    }
    async getAttendanceBySlot(scheduleId, date, section) {
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);
        const records = await prisma_1.default.attendance.findMany({
            where: {
                schedule_id: scheduleId,
                date: attendanceDate,
                section: section,
                is_deleted: false
            },
            select: {
                student_id: true,
                status: true,
                topic: true
            }
        });
        if (records.length === 0) {
            return { records: [], topic: null };
        }
        return {
            records: records.map(r => ({
                student_id: r.student_id,
                status: r.status
            })),
            topic: records[0].topic
        };
    }
    async getStudentAttendance(studentId) {
        return await prisma_1.default.attendance.findMany({
            where: {
                student_id: studentId,
                is_deleted: false
            },
            include: {
                schedule: {
                    select: {
                        name: true,
                        type: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
    }
}
exports.CRTService = CRTService;
//# sourceMappingURL=crt.service.js.map