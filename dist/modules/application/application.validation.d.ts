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
export declare const bulkUpdateStatusSchema: z.ZodObject<{
    company_name: z.ZodString;
    updates: z.ZodArray<z.ZodObject<{
        roll_no: z.ZodString;
        status: z.ZodEffects<z.ZodEnum<["APPLIED", "SHORTLISTED", "REJECTED", "PLACED", "Not Applied", "Not Applied "]>, "APPLIED" | "SHORTLISTED" | "REJECTED" | "PLACED", "APPLIED" | "SHORTLISTED" | "REJECTED" | "PLACED" | "Not Applied" | "Not Applied ">;
    }, "strip", z.ZodTypeAny, {
        status: "APPLIED" | "SHORTLISTED" | "REJECTED" | "PLACED";
        roll_no: string;
    }, {
        status: "APPLIED" | "SHORTLISTED" | "REJECTED" | "PLACED" | "Not Applied" | "Not Applied ";
        roll_no: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    company_name: string;
    updates: {
        status: "APPLIED" | "SHORTLISTED" | "REJECTED" | "PLACED";
        roll_no: string;
    }[];
}, {
    company_name: string;
    updates: {
        status: "APPLIED" | "SHORTLISTED" | "REJECTED" | "PLACED" | "Not Applied" | "Not Applied ";
        roll_no: string;
    }[];
}>;
//# sourceMappingURL=application.validation.d.ts.map