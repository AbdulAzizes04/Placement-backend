"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const encryption_1 = require("../../utils/encryption");
class StudentService {
    // New Single Student Creation Wrapper
    async createStudentWithUser(collegeId, data) {
        const email = data.email || undefined;
        const rollNoHash = (0, encryption_1.hash)(data.roll_no);
        const emailHash = email ? (0, encryption_1.hash)(email) : undefined;
        // 1. Check duplicates using Blind Index (Hash)
        const existing = await prisma_1.default.user.findFirst({
            where: {
                OR: [
                    { username_hash: rollNoHash },
                    ...(emailHash ? [{ email_hash: emailHash }] : [])
                ]
            }
        });
        if (existing) {
            throw new Error(`User collision: Roll No '${data.roll_no}' or Email '${data.email}' already exists.`);
        }
        // 2. Transaction
        const initialPassword = data.roll_no; // User Requirement: Roll No as Password
        const hashedPassword = await bcryptjs_1.default.hash(initialPassword, 10);
        return await prisma_1.default.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username: (0, encryption_1.encrypt)(data.roll_no), // Encrypted
                    username_hash: rollNoHash, // Hash for lookup
                    email: email ? (0, encryption_1.encrypt)(email) : null, // Encrypted
                    email_hash: emailHash, // Hash
                    password: hashedPassword,
                    name: data.name, // Name is not PII in this context? User didn't ask. keeping plaintext for now.
                    phone: data.phone ? (0, encryption_1.encrypt)(data.phone) : null,
                    phone_hash: data.phone ? (0, encryption_1.hash)(data.phone) : null,
                    role: 'STUDENT',
                    college_id: collegeId,
                    mustChangePassword: true
                }
            });
            const profile = await tx.studentProfile.create({
                data: {
                    user_id: user.id,
                    college_id: collegeId,
                    roll_no: (0, encryption_1.encrypt)(data.roll_no), // Encrypted
                    roll_no_hash: rollNoHash, // Hash
                    branch: data.branch,
                    year: Number(data.year),
                    batch: data.batch,
                    cgpa: Number(data.cgpa),
                    skills: data.skills || [],
                    status: data.status || 'Unplaced'
                }
            });
            return { user, profile, initialPassword };
        });
    }
    // Deprecated direct createProfile, use createStudentWithUser instead for new students.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createProfile(userId, collegeId, data) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { name, email, phone, role, password, username, ...profileData } = data;
        // If roll_no is in profileData, we must encrypt/hash it
        const rollNo = profileData.roll_no;
        const rollNoEnc = rollNo ? (0, encryption_1.encrypt)(rollNo) : undefined;
        const rollNoHash = rollNo ? (0, encryption_1.hash)(rollNo) : undefined;
        return await prisma_1.default.studentProfile.create({
            data: {
                user_id: userId,
                college_id: collegeId,
                ...profileData,
                roll_no: rollNoEnc, // Encrypted
                roll_no_hash: rollNoHash, // Hash
                // Ensure defaults if missing
                batch: profileData.batch || "2024-2025",
                status: profileData.status || "Unplaced"
            },
        });
    }
    async getProfile(userId) {
        const profile = await prisma_1.default.studentProfile.findUnique({
            where: { user_id: userId },
        });
        if (profile) {
            profile.roll_no = (0, encryption_1.decrypt)(profile.roll_no);
        }
        return profile;
    }
    async getStudentByRollNo(rollNo) {
        // Lookup by HASH
        const profile = await prisma_1.default.studentProfile.findUnique({
            where: { roll_no_hash: (0, encryption_1.hash)(rollNo) }
        });
        if (profile) {
            profile.roll_no = (0, encryption_1.decrypt)(profile.roll_no);
        }
        return profile;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async updateProfile(userId, data) {
        // Determine if we are updating PII fields
        const updateData = { ...data };
        // If updating roll_no, must encrypt and hash
        if (updateData.roll_no) {
            updateData.roll_no_hash = (0, encryption_1.hash)(updateData.roll_no);
            updateData.roll_no = (0, encryption_1.encrypt)(updateData.roll_no);
        }
        const profile = await prisma_1.default.studentProfile.update({
            where: { user_id: userId },
            data: updateData,
        });
        // Decrypt return value
        if (profile && profile.roll_no)
            profile.roll_no = (0, encryption_1.decrypt)(profile.roll_no);
        return profile;
    }
    async getStatistics(collegeId, filters = {}) {
        // Current year/batch logic
        const currentYear = new Date().getFullYear();
        const batch = filters.batch || `${currentYear}-${currentYear + 4}`;
        const [total, placed, crt, branchStats, activeAnnouncements] = await Promise.all([
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
            }),
            prisma_1.default.announcement.count({
                where: {
                    college_id: collegeId,
                    is_deleted: false,
                    deadline: {
                        gte: new Date(),
                    }
                }
            })
        ]);
        // For branch placement data, we need more granular counts.
        // NOTE: Prisma groupBy does NOT support relation filters (e.g. placement_records: { some: {} }).
        // So we first fetch placed student profile IDs from PlacementRecord, then filter by scalar ID.
        const placedProfileRecords = await prisma_1.default.placementRecord.findMany({
            select: { student_id: true },
            distinct: ['student_id']
        });
        const placedProfileIds = placedProfileRecords
            .map(r => r.student_id)
            .filter((id) => id !== null);
        const branchPlacedStats = await prisma_1.default.studentProfile.groupBy({
            by: ['branch'],
            where: {
                college_id: collegeId,
                batch: batch,
                OR: [
                    { status: 'Placed' },
                    { id: { in: placedProfileIds } }
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
            branchDistribution,
            activeAnnouncements
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getAllStudents(filters, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        // Filters might contain PII (e.g. searching by roll number). 
        // Usually filters are like branch, year, etc (non-PII).
        // If 'roll_no' is in filters, we must hash it.
        const whereClause = {
            ...filters,
            is_deleted: false,
        };
        if (whereClause.roll_no) {
            whereClause.roll_no_hash = (0, encryption_1.hash)(whereClause.roll_no);
            delete whereClause.roll_no;
        }
        // Same for name? Name is not encrypted.
        const [students, total] = await Promise.all([
            prisma_1.default.studentProfile.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true, // This is now ENCRYPTED
                            username: true, // This is now ENCRYPTED (roll_no)
                            role: true,
                            college_id: true
                        }
                    },
                    placement_records: {
                        where: { is_deleted: false }
                    },
                }
            }),
            prisma_1.default.studentProfile.count({
                where: whereClause
            })
        ]);
        // Decrypt and Sort ALL matching records in memory
        const decryptedStudents = students.map(s => {
            return {
                ...s,
                roll_no: (0, encryption_1.decrypt)(s.roll_no),
                user: s.user ? {
                    ...s.user,
                    email: (0, encryption_1.decrypt)(s.user.email || ''),
                    username: (0, encryption_1.decrypt)(s.user.username || '')
                } : null
            };
        }).sort((a, b) => {
            // Custom alphanumeric sort for roll numbers (e.g. 21B81A0501 < 21B81A05A1)
            const rollA = a.roll_no ? a.roll_no.toUpperCase() : "";
            const rollB = b.roll_no ? b.roll_no.toUpperCase() : "";
            return rollA.localeCompare(rollB, undefined, { numeric: true, sensitivity: 'base' });
        });
        // Apply Pagination IN MEMORY
        const paginatedStudents = decryptedStudents.slice(skip, skip + limit);
        return {
            students: paginatedStudents,
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
                const rollNoHash = (0, encryption_1.hash)(normalizedRollNo);
                try {
                    // Lookup by Hash
                    let existingProfile = await prisma_1.default.studentProfile.findUnique({
                        where: { roll_no_hash: rollNoHash },
                        include: { user: true }
                    });
                    const email = (row.email || "").trim().toLowerCase();
                    const emailHash = email ? (0, encryption_1.hash)(email) : undefined;
                    if (!existingProfile && email) {
                        const existingUser = await prisma_1.default.user.findUnique({
                            where: { email_hash: emailHash }
                        });
                        if (existingUser) {
                            existingProfile = await prisma_1.default.studentProfile.findUnique({
                                where: { user_id: existingUser.id },
                                include: { user: true }
                            });
                        }
                    }
                    if (existingProfile) {
                        // Update
                        // Encrypt and Hash new values
                        const updateData = {
                            branch: row.branch,
                            year: Number(row.year),
                            cgpa: Number(row.cgpa),
                            batch: row.batch,
                            skills: row.skills || existingProfile.skills,
                            status: row.status || existingProfile.status,
                            is_crt: row.is_crt ?? existingProfile.is_crt,
                            crt_marks: row.crt_marks !== undefined ? Number(row.crt_marks) : existingProfile.crt_marks
                        };
                        // If updating roll_no (rare but possible in bulk sync if we matched by email?)
                        // Actually normalizedRollNo is what we matched on. 
                        await prisma_1.default.studentProfile.update({
                            where: { id: existingProfile.id },
                            data: updateData
                        });
                        // Update User PII
                        const userUpdateData = {};
                        if (row.name)
                            userUpdateData.name = row.name;
                        if (row.phone) {
                            userUpdateData.phone = (0, encryption_1.encrypt)(row.phone);
                            userUpdateData.phone_hash = (0, encryption_1.hash)(row.phone);
                        }
                        if (email) { // If email provided
                            // Check if different? Need to decrypt existing to check? Or just compare hashes.
                            // existingProfile.user.email is encrypted. 
                            // We don't have existingProfile.user.email_hash in included user type unless we selected it?
                            // Default include selects all scalars.
                            // But TypeScript might not know about dynamic fields if we didn't update generated client types yet. 
                            // Assuming client re-generated.
                            // Just overwriting is safer than decrypting to check.
                            userUpdateData.email = (0, encryption_1.encrypt)(email);
                            userUpdateData.email_hash = emailHash;
                        }
                        // Always ensure username matches roll_no (encrypted)
                        userUpdateData.username = (0, encryption_1.encrypt)(normalizedRollNo);
                        userUpdateData.username_hash = rollNoHash;
                        await prisma_1.default.user.update({
                            where: { id: existingProfile.user_id },
                            data: userUpdateData
                        });
                        results.updated++;
                    }
                    else {
                        // New Student
                        const existingUser = await prisma_1.default.user.findFirst({
                            where: { username_hash: rollNoHash }
                        });
                        if (existingUser) {
                            // Existing User, Create Profile
                            await prisma_1.default.studentProfile.create({
                                data: {
                                    user_id: existingUser.id,
                                    college_id: collegeId,
                                    roll_no: (0, encryption_1.encrypt)(normalizedRollNo),
                                    roll_no_hash: rollNoHash,
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
                            if (emailHash) {
                                const emailCheck = await prisma_1.default.user.findFirst({ where: { email_hash: emailHash } });
                                if (emailCheck) {
                                    results.skipped++;
                                    results.errors.push({ row: rowNum, reason: `Email ${email} already in use.` });
                                    return;
                                }
                            }
                        }
                        const initialPassword = normalizedRollNo; // User Requirement: Roll No as Password
                        const hashedPassword = await bcryptjs_1.default.hash(initialPassword, 10);
                        await prisma_1.default.$transaction(async (tx) => {
                            const newUser = await tx.user.create({
                                data: {
                                    name: row.name,
                                    email: email ? (0, encryption_1.encrypt)(email) : null,
                                    email_hash: emailHash,
                                    username: (0, encryption_1.encrypt)(normalizedRollNo),
                                    username_hash: rollNoHash,
                                    phone: row.phone ? (0, encryption_1.encrypt)(row.phone) : null,
                                    phone_hash: row.phone ? (0, encryption_1.hash)(row.phone) : null,
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
                                    roll_no: (0, encryption_1.encrypt)(normalizedRollNo),
                                    roll_no_hash: rollNoHash,
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
                        // @ts-ignore
                        if (!results.createdCredentials)
                            results.createdCredentials = [];
                        // @ts-ignore
                        results.createdCredentials.push({ roll_no: normalizedRollNo, password: initialPassword });
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
                const rollNoHash = (0, encryption_1.hash)(normalizedRollNo);
                const existingProfile = await prisma_1.default.studentProfile.findUnique({
                    where: { roll_no_hash: rollNoHash }
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
                    const userUpdates = {};
                    if (row.name)
                        userUpdates.name = row.name;
                    if (row.phone) {
                        userUpdates.phone = (0, encryption_1.encrypt)(row.phone);
                        userUpdates.phone_hash = (0, encryption_1.hash)(row.phone);
                    }
                    if (Object.keys(userUpdates).length > 0) {
                        await prisma_1.default.user.update({
                            where: { id: existingProfile.user_id },
                            data: userUpdates
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
    async deleteAllStudents(collegeId, batch) {
        return await prisma_1.default.$transaction(async (tx) => {
            // 1. Find all students for this college (and optionally batch)
            const profilesWhere = {
                college_id: collegeId,
            };
            if (batch) {
                profilesWhere.batch = batch;
            }
            const profiles = await tx.studentProfile.findMany({
                where: profilesWhere,
                select: { id: true, user_id: true }
            });
            if (profiles.length === 0) {
                return { count: 0 };
            }
            const userIds = profiles.map(p => p.user_id);
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
                where: { id: { in: userIds }, role: 'STUDENT' }
            });
            return { count: deleteResult.count };
        });
    }
}
exports.StudentService = StudentService;
//# sourceMappingURL=student.service.js.map