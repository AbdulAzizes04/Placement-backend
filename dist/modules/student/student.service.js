"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class StudentService {
    // New Single Student Creation Wrapper
    async createStudentWithUser(collegeId, data) {
        const email = data.email || undefined; // Ensure undefined for Prisma skip if empty string
        // 1. Check duplicates
        const existing = await prisma_1.default.user.findFirst({
            where: {
                OR: [
                    { username: data.roll_no },
                    ...(email ? [{ email: email }] : [])
                ]
            }
        });
        if (existing) {
            throw new Error(`User collision: Roll No '${data.roll_no}' or Email '${data.email}' already exists.`);
        }
        // 2. Transaction
        return await prisma_1.default.$transaction(async (tx) => {
            const hashedPassword = await bcryptjs_1.default.hash(data.roll_no, 10);
            const user = await tx.user.create({
                data: {
                    username: data.roll_no,
                    email: email, // Can be undefined
                    password: hashedPassword,
                    name: data.name,
                    phone: data.phone ?? null,
                    role: 'STUDENT',
                    college_id: collegeId,
                    mustChangePassword: true
                }
            });
            const profile = await tx.studentProfile.create({
                data: {
                    user_id: user.id,
                    college_id: collegeId,
                    roll_no: data.roll_no,
                    branch: data.branch,
                    year: Number(data.year),
                    batch: data.batch,
                    cgpa: Number(data.cgpa),
                    skills: data.skills || [],
                    status: data.status || 'Unplaced'
                }
            });
            return { user, profile };
        });
    }
    // Deprecated direct createProfile, use createStudentWithUser instead for new students.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createProfile(userId, collegeId, data) {
        // Strip User fields that might be in data (e.g. name, email) to avoid Prisma errors
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { name, email, phone, role, password, username, ...profileData } = data;
        return await prisma_1.default.studentProfile.create({
            data: {
                user_id: userId,
                college_id: collegeId,
                ...profileData,
                // Ensure defaults if missing
                batch: profileData.batch || "2024-2025",
                status: profileData.status || "Unplaced"
            },
        });
    }
    async getProfile(userId) {
        return await prisma_1.default.studentProfile.findUnique({
            where: { user_id: userId },
        });
    }
    async getStudentByRollNo(rollNo) {
        return await prisma_1.default.studentProfile.findUnique({
            where: { roll_no: rollNo }
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async updateProfile(userId, data) {
        return await prisma_1.default.studentProfile.update({
            where: { user_id: userId },
            data,
        });
    }
    async getStatistics(collegeId, filters = {}) {
        // Current year/batch logic
        const currentYear = new Date().getFullYear();
        const batch = filters.batch || `${currentYear}-${currentYear + 4}`;
        const [total, placed, crt, branchStats] = await await Promise.all([
            prisma_1.default.studentProfile.count({
                where: { college_id: collegeId, batch: batch }
            }),
            prisma_1.default.studentProfile.count({
                where: {
                    college_id: collegeId,
                    batch: batch,
                    OR: [
                        { status: 'Placed' },
                        { placement_records: { some: {} } }
                    ]
                }
            }),
            prisma_1.default.studentProfile.count({
                where: { college_id: collegeId, batch: batch, is_crt: true }
            }),
            prisma_1.default.studentProfile.groupBy({
                by: ['branch'],
                where: { college_id: collegeId, batch: batch },
                _count: { _all: true },
                // We also want placed per branch, but groupBy doesn't support complex counts easily
                // We'll calculate totals and placed separately if needed, or just return totals for now
            })
        ]);
        // For branch placement data, we need more granular counts
        const branchPlacedStats = await prisma_1.default.studentProfile.groupBy({
            by: ['branch'],
            where: {
                college_id: collegeId,
                batch: batch,
                OR: [
                    { status: 'Placed' },
                    { placement_records: { some: {} } }
                ]
            },
            _count: { _all: true }
        });
        const branchDistribution = branchStats.map(bs => ({
            branch: bs.branch,
            total: bs._count._all,
            placed: branchPlacedStats.find(bps => bps.branch === bs.branch)?._count._all || 0
        }));
        return {
            total,
            placed,
            crt,
            unplaced: total - placed,
            branchDistribution
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getAllStudents(filters, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [students, total] = await Promise.all([
            prisma_1.default.studentProfile.findMany({
                where: {
                    ...filters,
                    is_deleted: false,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            username: true,
                            role: true,
                            college_id: true
                        }
                    },
                    placement_records: {
                        where: { is_deleted: false }
                    },
                },
                orderBy: { roll_no: 'asc' },
                skip,
                take: limit
            }),
            prisma_1.default.studentProfile.count({
                where: {
                    ...filters,
                    is_deleted: false
                }
            })
        ]);
        return {
            students,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async bulkCreateStudents(students, collegeId) {
        const results = {
            inserted: 0,
            updated: 0,
            skipped: 0,
            failed: 0,
            errors: []
        };
        const CHUNK_SIZE = 50;
        for (let i = 0; i < students.length; i += CHUNK_SIZE) {
            const chunk = students.slice(i, i + CHUNK_SIZE);
            await Promise.all(chunk.map(async (row, index) => {
                const rowNum = i + index + 1;
                const normalizedRollNo = (row.roll_no || "").trim().toUpperCase();
                try {
                    let existingProfile = await prisma_1.default.studentProfile.findUnique({
                        where: { roll_no: normalizedRollNo },
                        include: { user: true }
                    });
                    const email = (row.email || "").trim().toLowerCase();
                    if (!existingProfile && email) {
                        existingProfile = await prisma_1.default.studentProfile.findFirst({
                            where: { user: { email: email } },
                            include: { user: true }
                        });
                    }
                    if (existingProfile) {
                        await prisma_1.default.studentProfile.update({
                            where: { id: existingProfile.id },
                            data: {
                                roll_no: normalizedRollNo,
                                branch: row.branch,
                                year: Number(row.year),
                                cgpa: Number(row.cgpa),
                                batch: row.batch,
                                skills: row.skills || existingProfile.skills,
                                status: row.status || existingProfile.status,
                                is_crt: row.is_crt ?? existingProfile.is_crt,
                                crt_marks: row.crt_marks !== undefined ? Number(row.crt_marks) : existingProfile.crt_marks
                            }
                        });
                        if (row.name || row.phone || (email && existingProfile.user.email !== email)) {
                            await prisma_1.default.user.update({
                                where: { id: existingProfile.user_id },
                                data: {
                                    name: row.name || undefined,
                                    phone: row.phone || undefined,
                                    email: email || undefined,
                                    username: normalizedRollNo
                                }
                            });
                        }
                        results.updated++;
                    }
                    else {
                        const existingUser = await prisma_1.default.user.findFirst({
                            where: { username: normalizedRollNo }
                        });
                        if (existingUser) {
                            await prisma_1.default.studentProfile.create({
                                data: {
                                    user_id: existingUser.id,
                                    college_id: collegeId,
                                    roll_no: normalizedRollNo,
                                    branch: row.branch,
                                    year: Number(row.year),
                                    cgpa: Number(row.cgpa),
                                    skills: row.skills || [],
                                    batch: row.batch,
                                    status: row.status || 'Unplaced',
                                    is_crt: row.is_crt || false,
                                    crt_marks: row.crt_marks !== undefined ? Number(row.crt_marks) : 0
                                }
                            });
                            results.inserted++;
                        }
                        else {
                            const rowEmail = row.email || undefined;
                            if (rowEmail) {
                                const emailCheck = await prisma_1.default.user.findUnique({ where: { email: rowEmail } });
                                if (emailCheck) {
                                    results.skipped++;
                                    results.errors.push({ row: rowNum, reason: `Email ${rowEmail} already in use.` });
                                    return;
                                }
                            }
                            const hashedPassword = await bcryptjs_1.default.hash(normalizedRollNo, 10);
                            await prisma_1.default.$transaction(async (tx) => {
                                const newUser = await tx.user.create({
                                    data: {
                                        name: row.name,
                                        email: rowEmail,
                                        username: normalizedRollNo,
                                        phone: row.phone ?? null,
                                        password: hashedPassword,
                                        role: 'STUDENT',
                                        college_id: collegeId,
                                        mustChangePassword: true
                                    }
                                });
                                await tx.studentProfile.create({
                                    data: {
                                        user_id: newUser.id,
                                        college_id: collegeId,
                                        roll_no: normalizedRollNo,
                                        branch: row.branch,
                                        year: Number(row.year),
                                        cgpa: Number(row.cgpa),
                                        skills: row.skills || [],
                                        batch: row.batch,
                                        status: row.status || 'Unplaced',
                                        is_crt: row.is_crt || false,
                                        crt_marks: row.crt_marks !== undefined ? Number(row.crt_marks) : 0
                                    }
                                });
                            });
                            results.inserted++;
                        }
                    }
                }
                catch (error) {
                    results.failed++;
                    results.errors.push({ row: rowNum, reason: error.message });
                }
            }));
            // Yield to event loop
            if (i + CHUNK_SIZE < students.length) {
                await new Promise(resolve => setImmediate(resolve));
            }
        }
        return results;
    }
    async bulkSyncStudents(students, collegeId) {
        const results = {
            updated: 0,
            skipped: 0,
            failed: 0,
            errors: []
        };
        for (let i = 0; i < students.length; i++) {
            const row = students[i];
            const rowNum = i + 1;
            const normalizedRollNo = (row.roll_no || "").trim().toUpperCase();
            if (!normalizedRollNo) {
                results.skipped++;
                results.errors.push({ row: rowNum, reason: "Missing Roll Number" });
                continue;
            }
            try {
                const existingProfile = await prisma_1.default.studentProfile.findUnique({
                    where: { roll_no: normalizedRollNo }
                });
                if (existingProfile) {
                    // UPDATE EXISTING
                    await prisma_1.default.studentProfile.update({
                        where: { id: existingProfile.id },
                        data: {
                            branch: row.branch || existingProfile.branch,
                            year: row.year ? Number(row.year) : existingProfile.year,
                            cgpa: row.cgpa !== undefined ? Number(row.cgpa) : existingProfile.cgpa,
                            batch: row.batch || existingProfile.batch,
                            is_crt: row.is_crt ?? existingProfile.is_crt,
                            crt_marks: row.crt_marks !== undefined ? Number(row.crt_marks) : existingProfile.crt_marks,
                            status: row.status || existingProfile.status
                        }
                    });
                    if (row.name || row.phone) {
                        await prisma_1.default.user.update({
                            where: { id: existingProfile.user_id },
                            data: {
                                name: row.name || undefined,
                                phone: row.phone || undefined
                            }
                        });
                    }
                    results.updated++;
                }
                else {
                    results.skipped++;
                    results.errors.push({ row: rowNum, roll_no: normalizedRollNo, reason: "Student not found in master data" });
                }
            }
            catch (error) {
                results.failed++;
                results.errors.push({ row: rowNum, roll_no: normalizedRollNo, reason: error.message });
            }
        }
        return results;
    }
    async deleteStudent(userIdOrProfileId) {
        // 1. Identify valid User and Profile first
        // Check if ID passed is User ID or Profile ID
        let profile = await prisma_1.default.studentProfile.findUnique({
            where: { id: userIdOrProfileId },
            include: { user: true }
        });
        if (!profile) {
            // Try treating as User ID
            profile = await prisma_1.default.studentProfile.findUnique({
                where: { user_id: userIdOrProfileId },
                include: { user: true }
            });
        }
        if (!profile)
            throw new Error("Student profile not found");
        const userId = profile.user_id;
        const profileId = profile.id;
        // 2. Transactional Delete
        return await prisma_1.default.$transaction(async (tx) => {
            // A. Delete Restricted Relations First
            await tx.application.deleteMany({
                where: { student_id: profileId }
            });
            await tx.attendance.deleteMany({
                where: { student_id: profileId }
            });
            // B. Delete User (Cascades to Profile & Placements)
            // Note: Relation on StudentProfile is onDelete: Cascade from User
            return await tx.user.delete({
                where: { id: userId }
            });
        });
    }
    async bulkDeleteStudents(userIds) {
        // 1. Transactional Operation
        return await prisma_1.default.$transaction(async (tx) => {
            // Step A: Fetch Users to validate existence and get Profile IDs
            const users = await tx.user.findMany({
                where: { id: { in: userIds } },
                include: { student_profile: true }
            });
            // Strict Validation: Ensure ALL requested users exist
            // If requests has duplicates, we unique them first to compare counts correctly
            const uniqueRequestedIds = Array.from(new Set(userIds));
            if (users.length !== uniqueRequestedIds.length) {
                throw new Error("One or more students not found. Partial deletion prevented.");
            }
            // Step B: Extract IDs
            const validUserIds = users.map(u => u.id);
            const profileIds = users
                .map(u => u.student_profile?.id)
                .filter((id) => !!id); // Filter out undefined if any user has no profile
            // Step C: Delete Dependent Records (Resolve RESTRICT constraints)
            if (profileIds.length > 0) {
                await tx.application.deleteMany({
                    where: { student_id: { in: profileIds } }
                });
                await tx.attendance.deleteMany({
                    where: { student_id: { in: profileIds } }
                });
            }
            // Step D: Delete Users (Cascades to Profile & Placements)
            const deleteResult = await tx.user.deleteMany({
                where: { id: { in: validUserIds } }
            });
            return { count: deleteResult.count };
        });
    }
    async deleteAllStudents(collegeId) {
        return await prisma_1.default.$transaction(async (tx) => {
            // 1. Find all students for this college
            const users = await tx.user.findMany({
                where: {
                    college_id: collegeId,
                    role: 'STUDENT'
                },
                select: { id: true }
            });
            if (users.length === 0) {
                return { count: 0 };
            }
            const userIds = users.map(u => u.id);
            // 2. Find their profiles to clean up relations
            const profiles = await tx.studentProfile.findMany({
                where: { user_id: { in: userIds } },
                select: { id: true }
            });
            const profileIds = profiles.map(p => p.id);
            // 3. Delete Restricted Relations
            if (profileIds.length > 0) {
                await tx.application.deleteMany({
                    where: { student_id: { in: profileIds } }
                });
                await tx.attendance.deleteMany({
                    where: { student_id: { in: profileIds } }
                });
            }
            // 4. Delete Users (Cascades to Profile & Placements)
            const deleteResult = await tx.user.deleteMany({
                where: { id: { in: userIds } }
            });
            return { count: deleteResult.count };
        });
    }
}
exports.StudentService = StudentService;
//# sourceMappingURL=student.service.js.map