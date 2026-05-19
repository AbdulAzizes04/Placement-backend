import { z } from 'zod';

export const applySchema = z.object({
  announcement_id: z.string().uuid(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['APPLIED', 'SHORTLISTED', 'REJECTED', 'PLACED']),
});

export const bulkUpdateStatusSchema = z.object({
  company_name: z.string(),
  updates: z.array(z.object({
    roll_no: z.string(),
    status: z.enum(['APPLIED', 'SHORTLISTED', 'REJECTED', 'PLACED', 'Not Applied', 'Not Applied ']).transform(val => {
      if (val.trim() === 'Not Applied') return 'APPLIED';
      return val as 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'PLACED';
    })
  })).min(1)
});