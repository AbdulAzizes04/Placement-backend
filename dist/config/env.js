"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(1),
    JWT_EXPIRES_IN: zod_1.z.string().min(1),
    EMAIL_HOST: zod_1.z.string().min(1),
    EMAIL_PORT: zod_1.z.coerce.number().int().positive(),
    EMAIL_USER: zod_1.z.string().email(),
    EMAIL_PASS: zod_1.z.string().min(1),
    AWS_ACCESS_KEY_ID: zod_1.z.string().min(1),
    AWS_SECRET_ACCESS_KEY: zod_1.z.string().min(1),
    AWS_REGION: zod_1.z.string().min(1),
    AWS_S3_BUCKET: zod_1.z.string().min(1),
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
});
exports.env = envSchema.parse(process.env);
//# sourceMappingURL=env.js.map