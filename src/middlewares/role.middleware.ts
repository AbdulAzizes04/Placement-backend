import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ROLES } from '../config/constants';

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

export const isAdmin = authorize(ROLES.ADMIN);
export const isStaff = authorize(ROLES.STAFF);
export const isTPO = authorize(ROLES.TPO);
export const isStudent = authorize(ROLES.STUDENT);