import { Request, Response } from 'express';
import { AnnouncementService } from './announcement.service';
import { StudentService } from '../student/student.service';
import { createAnnouncementSchema, updateAnnouncementSchema } from './announcement.validation';

const announcementService = new AnnouncementService();
const studentService = new StudentService();

export class AnnouncementController {
  async create(req: Request, res: Response) {
    try {
      const data = createAnnouncementSchema.parse(req.body);

      const cleanData = {
        company_name: data.company_name,
        job_role: data.job_role,
        description: data.description,
        application_link: data.application_link || null,
        required_cgpa: data.required_cgpa || null,
        required_skills: data.required_skills || [],
        allowed_branches: data.allowed_branches || [], // Empty array means ALL branches
        deadline: new Date(data.deadline),
        package: data.package || "N/A",
        is_crt_only: data.is_crt_only ?? false
      };

      // ensure authenticated user has college_id
      const user = (req as any).user;
      if (!user || !user.id) return res.status(401).json({ error: 'Unauthorized' });
      const collegeId = user.college_id;
      if (!collegeId) return res.status(400).json({ error: 'User does not belong to a college' });

      const announcement = await announcementService.create(
        cleanData,
        user.id,
        collegeId
      );
      res.status(201).json(announcement);
    } catch (error) {
      console.error('Announcement creation error:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query as any;
      const user = (req as any).user;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;

      // If authenticated, default to user's college
      if (user && user.college_id && !filters.college_id) {
        filters.college_id = user.college_id;
      }

      // If user is a STUDENT, fetch their profile to enforce branch visibility
      if (user && user.role === 'STUDENT') {
        const studentProfile = await studentService.getProfile(user.id);
        if (studentProfile) {
          if (studentProfile.branch) {
            filters.student_branch = studentProfile.branch;
          }
          filters.is_crt = studentProfile.is_crt;
        }
      }

      const result = await announcementService.getAll(filters, pageNum, limitNum);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const announcement = await announcementService.getById(req.params.id);
      if (!announcement) return res.status(404).json({ error: 'Not found' });
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = updateAnnouncementSchema.parse(req.body);
      const announcement = await announcementService.update(req.params.id, data);
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await announcementService.delete(req.params.id);
      res.json({ message: 'Deleted' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async bulkDelete(req: Request, res: Response) {
    try {
      const { ids } = req.body; // or validate with schema if strictly needed inside controller block, but typically done before or inline
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: "Invalid IDs provided" });
      }
      await announcementService.bulkDelete(ids);
      res.json({ message: 'Bulk deleted successfully', count: ids.length });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
