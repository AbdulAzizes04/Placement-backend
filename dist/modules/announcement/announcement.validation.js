"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteAnnouncementSchema = exports.updateAnnouncementSchema = exports.createAnnouncementSchema = void 0;
const zod_1 = require("zod");
exports.createAnnouncementSchema = zod_1.z.object({
    company_name: zod_1.z.string().min(1, 'Company name is required'),
    job_role: zod_1.z.string().min(1, 'Job role is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    application_link: zod_1.z.string().url('Invalid URL format').optional().or(zod_1.z.literal('')),
    required_cgpa: zod_1.z.number().min(0).max(10).optional().or(zod_1.z.literal(0)),
    required_skills: zod_1.z.array(zod_1.z.string().min(1)).optional().default([]),
    allowed_branches: zod_1.z.array(zod_1.z.string().min(1)).optional().default([]),
    package: zod_1.z.string().optional().or(zod_1.z.literal('')),
    is_crt_only: zod_1.z.boolean().optional().default(false),
    deadline: zod_1.z.string().datetime('Invalid date format'),
});
exports.updateAnnouncementSchema = exports.createAnnouncementSchema.partial();
exports.bulkDeleteAnnouncementSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.string().uuid())
});
//# sourceMappingURL=announcement.validation.js.map