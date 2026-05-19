import { z } from 'zod';


export const loginSchema = z.object({
  identifier: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(1, "Password is required"),
}).refine((data) => !!data.identifier || !!data.email, {
  message: "Email or Username is required",
  path: ["identifier"]
}).transform((data) => ({
  identifier: data.identifier || data.email,
  password: data.password
}));


export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(['STUDENT', 'STAFF', 'TPO', 'ADMIN']),
  college_id: z.string().uuid(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(6),
});

export const resetPasswordSchema = z.object({
  identifier: z.string().min(1, "User ID / Email is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});