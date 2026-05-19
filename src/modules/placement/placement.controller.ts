import { Request, Response } from 'express';
import { PlacementService } from './placement.service';

const placementService = new PlacementService();


import { StudentService } from '../student/student.service';
const studentService = new StudentService();

export class PlacementController {
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const record = await placementService.create(data);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, ...filters } = req.query as any;
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 50;

      const result = await placementService.getAll(filters, pageNum, limitNum);
      const { placements, meta } = result;

      const flatRecords = placements.map((record: any) => ({
        id: record.id,
        student_id: record.student_id,
        user_id: record.student?.user_id,
        roll_number: record.student?.roll_no || "N/A",
        name: record.student?.user?.name || "Unknown",
        branch: record.student?.branch || "N/A",
        year: record.student?.year || 0,
        cgpa: record.student?.cgpa || 0,
        contact: record.student?.user?.phone || "N/A",
        status: "Placed",
        company_name: record.company_name,
        package: record.package,
        offer_letter_url: record.offer_letter_url,
        placed_at: record.placed_at
      }));

      res.json({
        placements: flatRecords,
        meta
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getByStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const user = (req as any).user;

      // IDOR Protection
      if (user.role === 'STUDENT') {
        const profile = await studentService.getProfile(user.id);
        if (!profile || profile.id !== studentId) {
          return res.status(403).json({ error: "Access Denied: You can only view your own placements" });
        }
      }

      const records = await placementService.getByStudent(studentId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
