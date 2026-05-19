import { z } from 'zod';
export declare const applySchema: z.ZodObject<{
    announcement_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    announcement_id: string;
}, {
    announcement_id: string;
}>;
export declare const updateStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["APPLIED", "SHORTLISTED", "REJECTED", "PLACED"]>;
}, "strip", z.ZodTypeAny, {
    status: "APPLIED" | "SHORTLISTED" | "REJECTED" | "PLACED";
}, {
    status: "APPLIED" | "SHORTLISTED" | "REJECTED" | "PLACED";
}>;
//# sourceMappingURL=application.validation.d.ts.map