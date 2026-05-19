import { z } from 'zod';
export declare const loginSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    identifier: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email?: string | undefined;
    identifier?: string | undefined;
}, {
    password: string;
    email?: string | undefined;
    identifier?: string | undefined;
}>, {
    password: string;
    email?: string | undefined;
    identifier?: string | undefined;
}, {
    password: string;
    email?: string | undefined;
    identifier?: string | undefined;
}>, {
    identifier: string | undefined;
    password: string;
}, {
    password: string;
    email?: string | undefined;
    identifier?: string | undefined;
}>;
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodEnum<["STUDENT", "STAFF", "TPO", "ADMIN"]>;
    college_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    role: "STUDENT" | "STAFF" | "TPO" | "ADMIN";
    college_id: string;
    phone?: string | undefined;
}, {
    name: string;
    email: string;
    password: string;
    role: "STUDENT" | "STAFF" | "TPO" | "ADMIN";
    college_id: string;
    phone?: string | undefined;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    oldPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    oldPassword: string;
    newPassword: string;
}, {
    oldPassword: string;
    newPassword: string;
}>;
//# sourceMappingURL=auth.validation.d.ts.map