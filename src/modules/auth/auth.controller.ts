import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema, changePasswordSchema, resetPasswordSchema } from './auth.validation';
import { z } from 'zod';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const user = await authService.register(data);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      // Schema now transforms email -> identifier locally if needed
      const { identifier, password } = loginSchema.parse(req.body);

      if (!identifier) {
        return res.status(400).json({ error: "Email or Username is required" });
      }

      const result = await authService.login({ identifier, password });

      // Set secure cookie
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // false in dev
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Login Error:", error);
      res.status(401).json({ error: (error as Error).message });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);
      const result = await authService.changePassword((req as any).user.id, oldPassword, newPassword);

      // Set secure cookie
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ message: 'Password changed successfully', token: result.token, user: result.user });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { identifier, newPassword } = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPasswordDirect(identifier, newPassword);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(400).json({ error: (error as Error).message });
    }
  }
}