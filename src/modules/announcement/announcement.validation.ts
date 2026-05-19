import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  job_role: z.string().min(1, 'Job role is required'),
  description: z.string().min(1, 'Description is required'),
  application_link: z.string().url('Invalid URL format').optional().or(z.literal('')),
  required_cgpa: z.number().min(0).max(10).optional().or(z.literal(0)),
  required_skills: z.array(z.string().min(1)).optional().default([]),
  allowed_branches: z.array(z.string().min(1)).optional().default([]),
  package: z.string().optional().or(z.literal('')),
  is_crt_only: z.boolean().optional().default(false),
  deadline: z.string().datetime('Invalid date format'),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

export const bulkDeleteAnnouncementSchema = z.object({
  ids: z.array(z.string().uuid())
});