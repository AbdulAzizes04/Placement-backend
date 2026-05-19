import { z } from 'zod';
export declare const createAnnouncementSchema: z.ZodObject<{
    company_name: z.ZodString;
    job_role: z.ZodString;
    description: z.ZodString;
    application_link: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    required_cgpa: z.ZodUnion<[z.ZodOptional<z.ZodNumber>, z.ZodLiteral<0>]>;
    required_skills: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    allowed_branches: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    package: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    is_crt_only: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    deadline: z.ZodString;
}, "strip", z.ZodTypeAny, {
    company_name: string;
    job_role: string;
    description: string;
    required_skills: string[];
    allowed_branches: string[];
    is_crt_only: boolean;
    deadline: string;
    package?: string | undefined;
    application_link?: string | undefined;
    required_cgpa?: number | undefined;
}, {
    company_name: string;
    job_role: string;
    description: string;
    deadline: string;
    package?: string | undefined;
    application_link?: string | undefined;
    required_cgpa?: number | undefined;
    required_skills?: string[] | undefined;
    allowed_branches?: string[] | undefined;
    is_crt_only?: boolean | undefined;
}>;
export declare const updateAnnouncementSchema: z.ZodObject<{
    company_name: z.ZodOptional<z.ZodString>;
    job_role: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    application_link: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    required_cgpa: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodNumber>, z.ZodLiteral<0>]>>;
    required_skills: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    allowed_branches: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    package: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    is_crt_only: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
    deadline: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    company_name?: string | undefined;
    package?: string | undefined;
    job_role?: string | undefined;
    description?: string | undefined;
    application_link?: string | undefined;
    required_cgpa?: number | undefined;
    required_skills?: string[] | undefined;
    allowed_branches?: string[] | undefined;
    is_crt_only?: boolean | undefined;
    deadline?: string | undefined;
}, {
    company_name?: string | undefined;
    package?: string | undefined;
    job_role?: string | undefined;
    description?: string | undefined;
    application_link?: string | undefined;
    required_cgpa?: number | undefined;
    required_skills?: string[] | undefined;
    allowed_branches?: string[] | undefined;
    is_crt_only?: boolean | undefined;
    deadline?: string | undefined;
}>;
export declare const bulkDeleteAnnouncementSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    ids: string[];
}, {
    ids: string[];
}>;
//# sourceMappingURL=announcement.validation.d.ts.map