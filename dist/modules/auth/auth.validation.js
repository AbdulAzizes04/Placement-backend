"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    identifier: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    password: zod_1.z.string().min(1, "Password is required"),
}).refine((data) => !!data.identifier || !!data.email, {
    message: "Email or Username is required",
    path: ["identifier"]
}).transform((data) => ({
    identifier: data.identifier || data.email,
    password: data.password
}));
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    phone: zod_1.z.string().optional(),
    role: zod_1.z.enum(['STUDENT', 'STAFF', 'TPO', 'ADMIN']),
    college_id: zod_1.z.string().uuid(),
});
exports.changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string(),
    newPassword: zod_1.z.string().min(6),
});
//# sourceMappingURL=auth.validation.js.map