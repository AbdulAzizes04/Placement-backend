import { Request, Response, NextFunction } from 'express';

export const softDeleteFilter = (req: Request, res: Response, next: NextFunction) => {
  // This middleware can be used to automatically filter out soft deleted records
  // For Prisma, we can add where: { deletedAt: null } to queries
  // But since it's per model, better to handle in services
  next();
};