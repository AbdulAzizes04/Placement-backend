import { z } from 'zod';

export const createStudentProfileSchema = z.object({
  roll_no: z.string(),
  branch: z.string(),
  year: z.number().int(),
  cgpa: z.number().min(0).max(10),
  skills: z.array(z.string()),
  resume_url: z.string().url().optional(),
  marks10_url: z.string().url().optional(),
  marks12_url: z.string().url().optional(),
  is_crt: z.boolean().optional().default(false),
});

export const createStudentSchema = createStudentProfileSchema.extend({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  batch: z.string().min(1),
  status: z.string().optional(),
});

export const updateStudentProfileSchema = createStudentProfileSchema.partial();

export const studentImportSchema = z.object({
  name: z.string().trim().min(1),
  roll_no: z.string().trim().min(1),
  branch: z.string().trim().min(1),
  year: z.preprocess(
    (val) => Number(val),
    z.number().int()
  ),
  batch: z.string().trim().min(1),
  cgpa: z.preprocess(
    (val) => Number(val),
    z.number()
  ),
  phone: z.string().trim().optional(),
  email: z.preprocess(
    (val) => val === "" ? undefined : val,
    z.string().email().optional()
  ),
  status: z.preprocess(
    (val) => val?.toString().trim(),
    z.string().min(1)
  ).optional(),
  is_crt: z.preprocess(
    (val) => {
      const str = val?.toString().toLowerCase().trim();
      return str === "yes" || str === "true";
    },
    z.boolean()
  ).optional().default(false)
}).strict();

export const bulkImportSchema = z.object({
  students: z.array(studentImportSchema).min(1)
});