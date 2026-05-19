import { Request, Response } from 'express';
export declare const importBatches: (req: Request, res: Response) => Promise<void>;
export declare const checkAvailability: (req: Request, res: Response) => Promise<void>;
export declare const allocateBatches: (req: Request, res: Response) => Promise<void>;
export declare const getBatches: (req: Request, res: Response) => Promise<void>;
export declare const getBranchStats: (req: Request, res: Response) => Promise<void>;
export declare const getBatchById: (req: Request, res: Response) => Promise<void>;
export declare const deleteBatch: (req: Request, res: Response) => Promise<void>;
export declare const exportBatch: (req: Request, res: Response) => Promise<void>;
export declare const unassignStudent: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=batches.controller.d.ts.map