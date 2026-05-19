import { Request, Response } from 'express';
import { CRTService } from './crt.service';
import { StudentService } from '../student/student.service';
import { analyticsCache } from '../../services/cache.service';

const crtService = new CRTService();
const studentService = new StudentService();

export class CRTController {
  async createBatch(req: Request, res: Response) {
    try {
      const data = req.body;
      const batch = await crtService.createBatch(data);
      res.status(201).json(batch);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getBatches(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      let studentId = undefined;

      if (user && user.role === 'STUDENT') {
        const profile = await studentService.getProfile(user.id);
        if (!profile || !profile.is_crt) {
          // Non-CRT students see NO batches
          return res.json([]);
        }
        studentId = profile.id;
      }

      const batches = await crtService.getBatches(studentId);
      res.json(batches);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async markAttendance(req: Request, res: Response) {
    try {
      const data = req.body;
      const attendance = await crtService.markAttendance(data);
      res.status(201).json(attendance);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Legacy method removed.


  // --- Batch Allocation ---

  async previewBatch(req: Request, res: Response) {
    try {
      const { minMarks, maxMarks } = req.body;
      const stats = await crtService.previewBatch(Number(minMarks), Number(maxMarks));
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async allocateBatch(req: Request, res: Response) {
    try {
      const { batchName, totalStrength, allocations, minMarks, maxMarks } = req.body;

      // Basic validation
      const allocatedSum = Object.values(allocations as Record<string, number>).reduce((a, b) => a + b, 0);
      if (allocatedSum !== Number(totalStrength)) {
        return res.status(400).json({ error: `Allocation sum (${allocatedSum}) does not match total strength (${totalStrength})` });
      }

      const result = await crtService.allocateBatch(
        batchName,
        Number(totalStrength),
        allocations,
        Number(minMarks),
        Number(maxMarks)
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async importStudents(req: Request, res: Response) {
    try {
      const { students } = req.body; // Expecting array of { roll_no, marks }
      const result = await crtService.importStudentMarks(students);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // --- Schedule & Attendance ---

  async createSchedule(req: Request, res: Response) {
    try {
      // Expecting entire object in body
      const schedule = await crtService.createSchedule(req.body);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getSchedules(req: Request, res: Response) {
    try {
      const { academic_year, type, page = 1, limit = 20 } = req.query;
      const user = (req as any).user;
      let studentProfile = undefined;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;

      if (user && user.role === 'STUDENT') {
        studentProfile = await studentService.getProfile(user.id);
        if (!studentProfile || !studentProfile.is_crt) {
          return res.json({ schedules: [], meta: { total: 0, page: pageNum, limit: limitNum, totalPages: 0 } });
        }
      }

      const result = await crtService.getSchedules({
        academic_year: academic_year as string,
        type: type as string,
        studentId: studentProfile?.id,
        branch: studentProfile?.branch
      }, pageNum, limitNum);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async deleteSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await crtService.deleteSchedule(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getFacultySchedules(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;

      const result = await crtService.getFacultySchedules(userId, pageNum, limitNum);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getScheduleStudents(req: Request, res: Response) {
    try {
      const students = await crtService.getScheduleStudents(req.params.id);
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async markDailyAttendance(req: Request, res: Response) {
    try {
      const { date, section, topic, records } = req.body;
      const result = await crtService.markDailyAttendance(
        req.params.id,
        date,
        section,
        topic,
        records
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getScheduleAnalytics(req: Request, res: Response) {
    try {
      const cacheKey = `schedule_analytics:${req.params.id}`;
      const cached = analyticsCache.get(cacheKey);
      if (cached) return res.json(cached);

      const analytics = await crtService.getScheduleAnalytics(req.params.id);
      analyticsCache.set(cacheKey, analytics, 60); // Cache for 1 minute
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getAttendanceBySlot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { date, section } = req.query;

      if (!date || !section) {
        return res.status(400).json({ error: "Date and section are required" });
      }

      const result = await crtService.getAttendanceBySlot(
        id,
        date as string,
        section as any
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getMyAttendance(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user || user.role !== 'STUDENT') {
        return res.status(403).json({ error: "Only students can access their attendance" });
      }

      const profile = await studentService.getProfile(user.id);
      if (!profile) {
        return res.status(404).json({ error: "Student profile not found" });
      }

      const attendance = await crtService.getStudentAttendance(profile.id);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
