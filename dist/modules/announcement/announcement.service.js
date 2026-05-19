"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class AnnouncementService {
    async create(data, userId, collegeId) {
        return await prisma_1.default.announcement.create({
            data: {
                ...data,
                created_by: userId,
                college_id: collegeId,
            },
        });
    }
    async getAll(filters, page = 1, limit = 20) {
        const { search, ...otherFilters } = filters;
        const skip = (page - 1) * limit;
        const whereClause = {
            is_deleted: false,
        };
        if (search) {
            whereClause.OR = [
                { company_name: { contains: search, mode: 'insensitive' } },
                { job_role: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (otherFilters.college_id) {
            whereClause.college_id = otherFilters.college_id;
        }
        if (otherFilters.student_branch) {
            whereClause.AND = [
                {
                    OR: [
                        { allowed_branches: { has: otherFilters.student_branch } },
                        { allowed_branches: { equals: [] } }
                    ]
                }
            ];
            if (otherFilters.is_crt !== undefined) {
                if (!otherFilters.is_crt) {
                    whereClause.is_crt_only = false;
                }
            }
        }
        const [announcements, total] = await Promise.all([
            prisma_1.default.announcement.findMany({
                where: whereClause,
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
                include: {
                    creator: {
                        select: { name: true }
                    }
                }
            }),
            prisma_1.default.announcement.count({ where: whereClause })
        ]);
        return {
            announcements,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getById(id) {
        // use findFirst so we can apply non-unique filters (like is_deleted)
        return await prisma_1.default.announcement.findFirst({
            where: { id, is_deleted: false },
        });
    }
    async update(id, data) {
        return await prisma_1.default.announcement.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return await prisma_1.default.announcement.update({
            where: { id },
            data: { is_deleted: true },
        });
    }
    async bulkDelete(ids) {
        return await prisma_1.default.announcement.updateMany({
            where: { id: { in: ids } },
            data: { is_deleted: true },
        });
    }
}
exports.AnnouncementService = AnnouncementService;
//# sourceMappingURL=announcement.service.js.map