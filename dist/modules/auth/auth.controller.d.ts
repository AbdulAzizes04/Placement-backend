import { Request, Response } from 'express';
export declare class AuthController {
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    changePassword(req: Request, res: Response): Promise<void>;
    resetPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=auth.controller.d.ts.map