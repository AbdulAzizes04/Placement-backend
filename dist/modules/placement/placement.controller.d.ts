import { Request, Response } from 'express';
export declare class PlacementController {
    create(req: Request, res: Response): Promise<void>;
    getAll(req: Request, res: Response): Promise<void>;
    getByStudent(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=placement.controller.d.ts.map