"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const encryption_1 = require("../../utils/encryption");
class ApplicationService {
    async apply(studentId, announcementId) {
        return await prisma_1.default.application.create({
            data: {
                student_id: studentId,
                announcement_id: announcementId,
                status: 'APPLIED',
            },
        });
    }
    async getApplications(studentId) {
        return await prisma_1.default.application.findMany({
            where: {
                student_id: studentId,
                is_deleted: false,
                announcement: { is_deleted: false }
            },
            include: {
                announcement: true,
            },
        });
    }
    async updateStatus(id, status) {
        console.log(`[ApplicationService] Updating application ${id} to ${status}`);
        // Fetch application with related data first
        const application = await prisma_1.default.application.findUnique({
            where: { id },
            include: {
                announcement: true,
                student: true
            }
        });
        if (!application) {
            throw new Error("Application not found");
        }
        // Use transaction to ensure data consistency
        const result = await prisma_1.default.$transaction(async (tx) => {
            // 1. Update Application Status
            const updatedApp = await tx.application.update({
                where: { id },
                data: { status },
            });
            // 2. If status is PLACED, Create PlacementRecord and Update Student Profile
            if (status === 'PLACED') {
                console.log(`[ApplicationService] Application ${id} is PLACED. Creating PlacementRecord and updating StudentProfile.`);
                // Parse package from announcement (string "10 LPA" -> float 10)
                let packageValue = 0;
                const pkgStr = application.announcement.package;
                if (pkgStr) {
                    const match = pkgStr.match(/(\d+(\.\d+)?)/);
                    if (match)
                        packageValue = parseFloat(match[0]);
                }
                // Check if placement record already exists to avoid duplicates
                const existingPlacement = await tx.placementRecord.findFirst({
                    where: {
                        student_id: application.student_id,
                        company_name: application.announcement.company_name
                    }
                });
                if (!existingPlacement) {
                    await tx.placementRecord.create({
                        data: {
                            student_id: application.student_id,
                            company_name: application.announcement.company_name,
                            package: packageValue || null,
                            placed_at: new Date(),
                            // year: application.student.year, // Not in schema, schema checks? PlacementRecord schema has 'year' as Int? Let's check schema.
                            // Schema: placed_at, created_at, updated_at... Does it have 'year'? 
                            // Reader checks schema: PlacementRecord has id, student_id, company_name, package, offer_letter_url, placed_at...
                            // Wait, I saw mappedPlacements in frontend has 'year', but let me recheck backend schema.
                            // Step 61 view_file: PlacementRecord: id, student_id, company_name, package, offer_letter_url, placed_at... NO YEAR field in model PlacementRecord in schema.prisma?
                            // Let me check schema again. Lines 158-177.
                            // 158: model PlacementRecord {
                            // 164: company_name String
                            // 165: package Float?
                            // ...
                            // It does NOT have 'year'. It relies on `placed_at`. 
                            // Frontend might be deriving it.
                        }
                    });
                    console.log(`[ApplicationService] PlacementRecord created.`);
                }
                else {
                    console.log(`[ApplicationService] PlacementRecord already exists. Skipping.`);
                }
                // Update Student Profile Status
                await tx.studentProfile.update({
                    where: { id: application.student_id },
                    data: {
                        status: 'Placed'
                        // We could also update is_placed boolean if it existed, but 'status' string seems to be the source of truth
                    }
                });
                console.log(`[ApplicationService] StudentProfile status updated to 'Placed'.`);
            }
            return updatedApp;
        });
        console.log(`[ApplicationService] Transaction completed.`);
        return result;
    }
    async getAll(filters, page = 1, limit = 50) {
        const { company, search, branch, min_cgpa, status, ...otherFilters } = filters;
        const skip = (page - 1) * limit;
        const whereClause = {
            is_deleted: false,
            ...otherFilters
        };
        if (status && status !== 'ALL') {
            whereClause.status = status;
        }
        // Relational Filters
        const studentFilter = {};
        if (branch)
            studentFilter.branch = branch;
        if (min_cgpa)
            studentFilter.cgpa = { gte: parseFloat(min_cgpa) };
        if (Object.keys(studentFilter).length > 0) {
            whereClause.student = studentFilter;
        }
        if (company) {
            whereClause.announcement = {
                company_name: company,
                is_deleted: false
            };
        }
        else {
            whereClause.announcement = {
                is_deleted: false
            };
        }
        // Search Logic
        if (search) {
            whereClause.OR = [
                { student: { user: { name: { contains: search, mode: 'insensitive' } } } },
                { announcement: { company_name: { contains: search, mode: 'insensitive' } } },
                { announcement: { job_role: { contains: search, mode: 'insensitive' } } }
            ];
        }
        const [applications, total] = await Promise.all([
            prisma_1.default.application.findMany({
                where: whereClause,
                include: {
                    student: {
                        include: {
                            user: {
                                select: { name: true, email: true, phone: true }
                            }
                        }
                    },
                    announcement: true,
                },
                orderBy: { applied_at: 'desc' },
                skip,
                take: limit
            }),
            prisma_1.default.application.count({
                where: whereClause
            })
        ]);
        return {
            applications,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async bulkUpdateStatuses(companyName, updates) {
        console.log(`[ApplicationService] Bulk updating statuses for ${companyName}`);
        let successCount = 0;
        let errors = [];
        // 1. Get the most recent announcement for this company just in case we need to create new applications
        const announcement = await prisma_1.default.announcement.findFirst({
            where: { company_name: companyName, is_deleted: false },
            orderBy: { created_at: 'desc' }
        });
        if (!announcement) {
            throw new Error(`Active announcement not found for company: ${companyName}`);
        }
        for (const update of updates) {
            try {
                const rollHash = (0, encryption_1.hash)(update.roll_no);
                const student = await prisma_1.default.studentProfile.findUnique({
                    where: { roll_no_hash: rollHash }
                });
                if (!student) {
                    errors.push({ roll_no: update.roll_no, error: "Student not found" });
                    continue;
                }
                // Find existing application
                let application = await prisma_1.default.application.findFirst({
                    where: {
                        student_id: student.id,
                        announcement: { company_name: companyName },
                        is_deleted: false
                    }
                });
                if (!application) {
                    // If the status from CSV is APPLIED or higher, create it
                    application = await this.apply(student.id, announcement.id);
                }
                // If the new status differs from current status (or if it's new), update it
                if (application.status !== update.status) {
                    await this.updateStatus(application.id, update.status);
                }
                successCount++;
            }
            catch (err) {
                console.error(`Error updating roll_no ${update.roll_no}:`, err);
                errors.push({ roll_no: update.roll_no, error: err.message });
            }
        }
        return {
            success: true,
            message: `Successfully processed ${successCount} out of ${updates.length} applications.`,
            successCount,
            errors
        };
    }
}
exports.ApplicationService = ApplicationService;
//# sourceMappingURL=application.service.js.map