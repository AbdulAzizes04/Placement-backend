import { Request, Response } from 'express';
import { ApplicationService } from './application.service';
import { applySchema, updateStatusSchema, bulkUpdateStatusSchema } from './application.validation';

const applicationService = new ApplicationService();

import { catchAsync } from '../../utils/catchAsync';

export class ApplicationController {
  apply = catchAsync(async (req: Request, res: Response) => {
    const { announcement_id } = applySchema.parse(req.body);
    const application = await applicationService.apply((req as any).user.student_profile.id, announcement_id);
    res.status(201).json(application);
  });

  getMyApplications = catchAsync(async (req: Request, res: Response) => {
    const applications = await applicationService.getApplications((req as any).user.student_profile.id);
    res.json(applications);
  });

  updateStatus = catchAsync(async (req: Request, res: Response) => {
    console.log(`[ApplicationController] Updating status for ID: ${req.params.id} with body:`, req.body);
    const { status } = updateStatusSchema.parse(req.body);
    const application = await applicationService.updateStatus(req.params.id, status);
    console.log(`[ApplicationController] Update successful for ID: ${req.params.id}`, application);
    res.json(application);
  });

  getAll = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 50, ...filters } = req.query as any;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;

    const result = await applicationService.getAll(filters, pageNum, limitNum);
    // Standardizing pagination response format to { data, meta }
    // If result already has 'data' and 'meta', we just pass it down. 
    // If it has 'applications', we map it to 'data'.
    const data = (result as any).applications || (result as any).data || result;
    const meta = (result as any).meta || undefined;

    res.json({ data, meta });
  });

  bulkUpdate = catchAsync(async (req: Request, res: Response) => {
    console.log(`[ApplicationController] Bulk updating statuses`, req.body);
    const { company_name, updates } = bulkUpdateStatusSchema.parse(req.body);
    const result = await applicationService.bulkUpdateStatuses(company_name, updates);
    res.json(result);
  });
}

