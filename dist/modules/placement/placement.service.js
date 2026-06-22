"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacementService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const encryption_1 = require("../../utils/encryption");
class PlacementService {
    async create(data) {
        // 1. Validate student existence
        const student = await prisma_1.default.studentProfile.findUnique({
            where: { id: data.student_id }
        });
        if (!student) {
            throw new Error(`Invalid student_id: ${data.student_id} does not exist`);
        }
        // 2. Strict Creation using Connect
        return await prisma_1.default.placementRecord.create({
            data: {
                student: {
                    connect: { id: data.student_id }
                },
                company_name: data.company_name,
                package: data.package,
                // Defaulting fields if missing, or ensure they are passed
                placed_at: data.placed_at ? new Date(data.placed_at) : new Date(),
                offer_letter_url: data.offer_letter_url
            },
        });
    }
    async getAll(filters, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const { branch, search, ...otherFilters } = filters;
        const whereClause = {
            is_deleted: false,
            ...otherFilters
        };
        if (branch) {
            whereClause.student = {
                branch: branch
            };
        }
        if (search) {
            whereClause.OR = [
                {
                    company_name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    student: {
                        OR: [
                            {
                                user: {
                                    name: {
                                        contains: search,
                                        mode: 'insensitive'
                                    }
                                }
                            },
                            {
                                roll_no: {
                                    contains: search,
                                    mode: 'insensitive'
                                }
                            }
                        ]
                    }
                }
            ];
        }
        const [placements, total] = await Promise.all([
            prisma_1.default.placementRecord.findMany({
                where: whereClause,
                include: {
                    student: {
                        include: {
                            user: {
                                select: { name: true, email: true, phone: true }
                            }
                        }
                    }
                },
                orderBy: { placed_at: 'desc' },
                skip,
                take: limit
            }),
            prisma_1.default.placementRecord.count({
                where: whereClause
            })
        ]);
        const decryptedPlacements = placements.map(p => {
            // Map and decrypt the deeply queried fields
            const pData = { ...p };
            if (pData.student) {
                if (pData.student.roll_no) {
                    pData.student.roll_no = (0, encryption_1.decrypt)(pData.student.roll_no);
                }
                if (pData.student.user && pData.student.user.phone) {
                    pData.student.user.phone = (0, encryption_1.decrypt)(pData.student.user.phone);
                }
            }
            return pData;
        });
        return {
            placements: decryptedPlacements,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getByStudent(studentId) {
        return await prisma_1.default.placementRecord.findMany({
            where: {
                student_id: studentId,
                is_deleted: false,
            },
        });
    }
}
exports.PlacementService = PlacementService;
//# sourceMappingURL=placement.service.js.map