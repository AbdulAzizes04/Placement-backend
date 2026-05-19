"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkImportSchema = exports.studentImportSchema = exports.updateStudentProfileSchema = exports.createStudentSchema = exports.createStudentProfileSchema = void 0;
const zod_1 = require("zod");
exports.createStudentProfileSchema = zod_1.z.object({
    roll_no: zod_1.z.string(),
    branch: zod_1.z.string(),
    year: zod_1.z.number().int(),
    cgpa: zod_1.z.number().min(0).max(10),
    skills: zod_1.z.array(zod_1.z.string()),
    resume_url: zod_1.z.string().url().optional(),
    marks10_url: zod_1.z.string().url().optional(),
    marks12_url: zod_1.z.string().url().optional(),
    is_crt: zod_1.z.boolean().optional().default(false),
});
exports.createStudentSchema = exports.createStudentProfileSchema.extend({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    batch: zod_1.z.string().min(1),
    status: zod_1.z.string().optional(),
});
exports.updateStudentProfileSchema = exports.createStudentProfileSchema.partial();
exports.studentImportSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1),
    roll_no: zod_1.z.string().trim().min(1),
    branch: zod_1.z.string().trim().min(1),
    year: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().int()),
    batch: zod_1.z.string().trim().min(1),
    cgpa: zod_1.z.preprocess((val) => Number(val), zod_1.z.number()),
    phone: zod_1.z.string().trim().optional(),
    email: zod_1.z.preprocess((val) => val === "" ? undefined : val, zod_1.z.string().email().optional()),
    status: zod_1.z.preprocess((val) => val?.toString().trim(), zod_1.z.string().min(1)).optional(),
    is_crt: zod_1.z.preprocess((val) => {
        const str = val?.toString().toLowerCase().trim();
        return str === "yes" || str === "true";
    }, zod_1.z.boolean()).optional().default(false)
}).strict();
exports.bulkImportSchema = zod_1.z.object({
    students: zod_1.z.array(exports.studentImportSchema).min(1)
});
//# sourceMappingURL=student.validation.js.map