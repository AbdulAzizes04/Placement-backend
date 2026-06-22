import { z } from 'zod';
export declare const createStudentProfileSchema: z.ZodObject<{
    roll_no: z.ZodString;
    branch: z.ZodString;
    year: z.ZodNumber;
    cgpa: z.ZodNumber;
    skills: z.ZodArray<z.ZodString, "many">;
    resume_url: z.ZodOptional<z.ZodString>;
    marks10_url: z.ZodOptional<z.ZodString>;
    marks12_url: z.ZodOptional<z.ZodString>;
    is_crt: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    year: number;
    roll_no: string;
    branch: string;
    cgpa: number;
    is_crt: boolean;
    skills: string[];
    resume_url?: string | undefined;
    marks10_url?: string | undefined;
    marks12_url?: string | undefined;
}, {
    year: number;
    roll_no: string;
    branch: string;
    cgpa: number;
    skills: string[];
    is_crt?: boolean | undefined;
    resume_url?: string | undefined;
    marks10_url?: string | undefined;
    marks12_url?: string | undefined;
}>;
export declare const createStudentSchema: z.ZodObject<{
    roll_no: z.ZodString;
    branch: z.ZodString;
    year: z.ZodNumber;
    cgpa: z.ZodNumber;
    skills: z.ZodArray<z.ZodString, "many">;
    resume_url: z.ZodOptional<z.ZodString>;
    marks10_url: z.ZodOptional<z.ZodString>;
    marks12_url: z.ZodOptional<z.ZodString>;
    is_crt: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
} & {
    name: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    batch: z.ZodString;
    status: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    year: number;
    roll_no: string;
    branch: string;
    cgpa: number;
    batch: string;
    is_crt: boolean;
    skills: string[];
    status?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    resume_url?: string | undefined;
    marks10_url?: string | undefined;
    marks12_url?: string | undefined;
}, {
    name: string;
    year: number;
    roll_no: string;
    branch: string;
    cgpa: number;
    batch: string;
    skills: string[];
    status?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    is_crt?: boolean | undefined;
    resume_url?: string | undefined;
    marks10_url?: string | undefined;
    marks12_url?: string | undefined;
}>;
export declare const updateStudentProfileSchema: z.ZodObject<{
    roll_no: z.ZodOptional<z.ZodString>;
    branch: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodNumber>;
    cgpa: z.ZodOptional<z.ZodNumber>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    resume_url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    marks10_url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    marks12_url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    is_crt: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, "strip", z.ZodTypeAny, {
    year?: number | undefined;
    roll_no?: string | undefined;
    branch?: string | undefined;
    cgpa?: number | undefined;
    is_crt?: boolean | undefined;
    skills?: string[] | undefined;
    resume_url?: string | undefined;
    marks10_url?: string | undefined;
    marks12_url?: string | undefined;
}, {
    year?: number | undefined;
    roll_no?: string | undefined;
    branch?: string | undefined;
    cgpa?: number | undefined;
    is_crt?: boolean | undefined;
    skills?: string[] | undefined;
    resume_url?: string | undefined;
    marks10_url?: string | undefined;
    marks12_url?: string | undefined;
}>;
export declare const studentImportSchema: z.ZodObject<{
    name: z.ZodString;
    roll_no: z.ZodString;
    branch: z.ZodString;
    year: z.ZodEffects<z.ZodNumber, number, unknown>;
    batch: z.ZodString;
    cgpa: z.ZodEffects<z.ZodNumber, number, unknown>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    status: z.ZodOptional<z.ZodEffects<z.ZodString, string, unknown>>;
    is_crt: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodBoolean, boolean, unknown>>>;
}, "strict", z.ZodTypeAny, {
    name: string;
    year: number;
    roll_no: string;
    branch: string;
    cgpa: number;
    batch: string;
    is_crt: boolean;
    status?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    name: string;
    roll_no: string;
    branch: string;
    batch: string;
    status?: unknown;
    email?: unknown;
    phone?: string | undefined;
    year?: unknown;
    cgpa?: unknown;
    is_crt?: unknown;
}>;
export declare const bulkImportSchema: z.ZodObject<{
    students: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        roll_no: z.ZodString;
        branch: z.ZodString;
        year: z.ZodEffects<z.ZodNumber, number, unknown>;
        batch: z.ZodString;
        cgpa: z.ZodEffects<z.ZodNumber, number, unknown>;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
        status: z.ZodOptional<z.ZodEffects<z.ZodString, string, unknown>>;
        is_crt: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodBoolean, boolean, unknown>>>;
    }, "strict", z.ZodTypeAny, {
        name: string;
        year: number;
        roll_no: string;
        branch: string;
        cgpa: number;
        batch: string;
        is_crt: boolean;
        status?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    }, {
        name: string;
        roll_no: string;
        branch: string;
        batch: string;
        status?: unknown;
        email?: unknown;
        phone?: string | undefined;
        year?: unknown;
        cgpa?: unknown;
        is_crt?: unknown;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    students: {
        name: string;
        year: number;
        roll_no: string;
        branch: string;
        cgpa: number;
        batch: string;
        is_crt: boolean;
        status?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    }[];
}, {
    students: {
        name: string;
        roll_no: string;
        branch: string;
        batch: string;
        status?: unknown;
        email?: unknown;
        phone?: string | undefined;
        year?: unknown;
        cgpa?: unknown;
        is_crt?: unknown;
    }[];
}>;
//# sourceMappingURL=student.validation.d.ts.map