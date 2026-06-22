"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdateStatusSchema = exports.updateStatusSchema = exports.applySchema = void 0;
const zod_1 = require("zod");
exports.applySchema = zod_1.z.object({
    announcement_id: zod_1.z.string().uuid(),
});
exports.updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['APPLIED', 'SHORTLISTED', 'REJECTED', 'PLACED']),
});
exports.bulkUpdateStatusSchema = zod_1.z.object({
    company_name: zod_1.z.string(),
    updates: zod_1.z.array(zod_1.z.object({
        roll_no: zod_1.z.string(),
        status: zod_1.z.enum(['APPLIED', 'SHORTLISTED', 'REJECTED', 'PLACED', 'Not Applied', 'Not Applied ']).transform(val => {
            if (val.trim() === 'Not Applied')
                return 'APPLIED';
            return val;
        })
    })).min(1)
});
//# sourceMappingURL=application.validation.js.map