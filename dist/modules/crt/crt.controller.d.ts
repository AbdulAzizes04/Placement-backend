import { Request, Response } from 'express';
export declare class CRTController {
    createBatch(req: Request, res: Response): Promise<void>;
    getBatches(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    markAttendance(req: Request, res: Response): Promise<void>;
    previewBatch(req: Request, res: Response): Promise<void>;
    allocateBatch(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    importStudents(req: Request, res: Response): Promise<void>;
    createSchedule(req: Request, res: Response): Promise<void>;
    getSchedules(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getFacultySchedules(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getScheduleStudents(req: Request, res: Response): Promise<void>;
    markDailyAttendance(req: Request, res: Response): Promise<void>;
    getScheduleAnalytics(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAttendanceBySlot(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMyAttendance(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=crt.controller.d.ts.map