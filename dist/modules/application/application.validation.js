"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusSchema = exports.applySchema = void 0;
const zod_1 = require("zod");
exports.applySchema = zod_1.z.object({
    announcement_id: zod_1.z.string().uuid(),
});
exports.updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['APPLIED', 'SHORTLISTED', 'REJECTED', 'PLACED']),
});
//# sourceMappingURL=application.validation.js.map