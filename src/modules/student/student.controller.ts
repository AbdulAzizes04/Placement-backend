import { Request, Response } from 'express';
import { StudentService } from './student.service';
import { createStudentProfileSchema, updateStudentProfileSchema, bulkImportSchema, createStudentSchema } from './student.validation';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';

import { sanitizeCSV } from '../../utils/fileValidation';

const studentService = new StudentService();

import { catchAsync } from '../../utils/catchAsync';

export class StudentController {
  // Admin: Create Single Student (Auto-creates User)
  createStudent = catchAsync(async (req: Request, res: Response) => {
    // Use extended schema for full student creation (including User fields)
    const data = createStudentSchema.parse(req.body);
    const collegeId = (req as any).user.college_id;

    const result = await studentService.createStudentWithUser(collegeId, {
      ...data,
      status: data.status || 'Unplaced'
    });
    // Return the result directly as it now contains { user, profile, initialPassword }
    res.status(201).json(result);
  });

  // Self: Complete Profile (Legacy/User-driven)
  createProfile = catchAsync(async (req: Request, res: Response) => {
    const data = createStudentProfileSchema.parse(req.body);
    const profile = await studentService.createProfile((req as any).user.id, (req as any).user.college_id, data);
    res.status(201).json(profile);
  });

  bulkCreate = catchAsync(async (req: Request, res: Response) => {
    console.log("Incoming student sample:", req.body.students?.[0]);

    // Use strict schema from validation file
    const { students } = bulkImportSchema.parse(req.body);
    const collegeId = (req as any).user.college_id;

    if (!collegeId) {
      return res.status(400).json({ error: "College ID not found in session" });
    }

    console.log("Validation Passed. Processing...");

    // 🔒 Security Hardening: Sanitize CSV Data to prevent Formula Injection
    const sanitizedStudents = sanitizeCSV(students);

    const result = await studentService.bulkCreateStudents(sanitizedStudents, collegeId);
    // Result now includes createdCredentials array with plain text passwords
    res.json(result);
  });

  getProfile = catchAsync(async (req: Request, res: Response) => {
    const profile = await studentService.getProfile((req as any).user.id);
    res.json(profile);
  });

  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const data = updateStudentProfileSchema.parse(req.body);
    const profile = await studentService.updateProfile((req as any).user.id, data);
    res.json(profile);
  });

  getAllStudents = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 50, ...filters } = req.query;
    const collegeId = (req as any).user.college_id;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;

    const queryFilters: any = {
      ...filters,
      college_id: collegeId,
    };

    if (queryFilters.is_crt !== undefined) {
      queryFilters.is_crt = queryFilters.is_crt === 'true';
    }

    if (queryFilters.min_cgpa) {
      queryFilters.cgpa = { gte: parseFloat(queryFilters.min_cgpa) };
      delete queryFilters.min_cgpa;
    }

    if (queryFilters.search) {
      queryFilters.user = {
        name: { contains: queryFilters.search, mode: 'insensitive' }
      };
      delete queryFilters.search;
    }

    const result = await studentService.getAllStudents(queryFilters, pageNum, limitNum);
    const { students, meta } = result;

    const currentYear = new Date().getFullYear();

    const transformedStudents = students.map((s: any) => {
      let batch = s.batch;
      if (!batch) {
        const batchStart = currentYear - (s.year || 1);
        const batchEnd = batchStart + 4;
        batch = `${batchStart}-${batchEnd}`;
      }

      const isPlaced = s.placement_records && s.placement_records.length > 0;
      const dbStatus = s.status;
      const finalStatus = isPlaced ? 'Placed' : (dbStatus || 'Unplaced');

      return {
        id: s.user_id,
        profileId: s.id,
        rollNo: s.roll_no || "N/A",
        name: s.user?.name || "Unknown",
        branch: s.branch || "N/A",
        year: s.year || 0,
        batch: batch,
        cgpa: s.cgpa || 0,
        phone: s.user?.phone || null,
        email: s.user?.email || "N/A",
        status: finalStatus,
        is_crt: s.is_crt || false
      };
    });

    res.json({
      data: transformedStudents,
      meta
    });
  });

  deleteStudent = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await studentService.deleteStudent(id);
    res.json({ message: "Student and related account deleted successfully" });
  });

  bulkDelete = catchAsync(async (req: Request, res: Response) => {
    const { studentIds } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: "No student IDs provided" });
    }

    const result = await studentService.bulkDeleteStudents(studentIds);
    res.json({ message: "Bulk deletion successful", deletedCount: result.count });
  });

  deleteAllStudents = catchAsync(async (req: Request, res: Response) => {
    const { password, batch_year } = req.body;
    const user = (req as any).user;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // 1. Verify Admin Password
    const adminUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!adminUser || !(await bcrypt.compare(password, adminUser.password))) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // 2. Perform Delete All (filtered by batch_year if provided)
    const result = await studentService.deleteAllStudents(user.college_id, batch_year);

    console.log(`[Admin ${user.email}] Deleted students (Batch: ${batch_year || 'ALL'}). Count: ${result.count}`);
    res.json({ message: "Students deleted successfully", deletedCount: result.count });
  });

  getStatistics = catchAsync(async (req: Request, res: Response) => {
    const collegeId = (req as any).user.college_id;
    const filters = req.query;

    const stats = await studentService.getStatistics(collegeId, filters);
    res.json(stats);
  });
}
