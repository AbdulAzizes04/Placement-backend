import { Request, Response } from 'express';
export declare class StudentController {
    createStudent(req: Request, res: Response): Promise<void>;
    createProfile(req: Request, res: Response): Promise<void>;
    bulkCreate(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProfile(req: Request, res: Response): Promise<void>;
    updateProfile(req: Request, res: Response): Promise<void>;
    getAllStudents(req: Request, res: Response): Promise<void>;
    deleteStudent(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    bulkDelete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteAllStudents(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getStatistics(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=student.controller.d.ts.map