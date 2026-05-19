import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    college_id: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    // console.log("Debug Middleware: Auth Header:", authHeader ? "Present" : "Missing");

    let token = authHeader?.replace('Bearer ', '');

    // Fallback to cookie if header is missing
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      console.log("Debug Middleware: Access Denied - No Token");
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    req.user = decoded;

    // 🔒 Security Hardening: Enforce Password Change
    if (decoded.mustChangePassword) {
      const allowedPath = '/api/auth/change-password';
      const currentPath = req.originalUrl.split('?')[0];

      console.log(`Debug Middleware: Checking Path for Password Change Enforce`);
      console.log(`Current Path: '${currentPath}'`);
      console.log(`Allowed Path: '${allowedPath}'`);
      console.log(`Match? ${currentPath === allowedPath}`);

      if (currentPath !== allowedPath) {
        return res.status(403).json({
          message: 'Security Alert: You must change your password to proceed.',
          code: 'PASSWORD_CHANGE_REQUIRED'
        });
      }
    }

    next();
  } catch (error) {
    console.error("Debug Middleware: Token Verification Failed:", (error as Error).message);
    res.status(401).json({ message: 'Invalid token.', error: (error as Error).message });
  }
};