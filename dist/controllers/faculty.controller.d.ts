import { Request, Response } from 'express';
export declare const getFacultyList: (req: Request, res: Response) => Promise<void>;
export declare const getFacultyById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createFaculty: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateFaculty: (req: Request, res: Response) => Promise<void>;
export declare const deleteFaculty: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=faculty.controller.d.ts.map