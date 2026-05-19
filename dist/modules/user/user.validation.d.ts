import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["STUDENT", "STAFF", "TPO", "ADMIN"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    role?: "STUDENT" | "STAFF" | "TPO" | "ADMIN" | undefined;
}, {
    name: string;
    email: string;
    password: string;
    role?: "STUDENT" | "STAFF" | "TPO" | "ADMIN" | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    phone?: string | undefined;
}, {
    name?: string | undefined;
    phone?: string | undefined;
}>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
//# sourceMappingURL=user.validation.d.ts.map