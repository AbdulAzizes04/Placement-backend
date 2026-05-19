"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementController = void 0;
const announcement_service_1 = require("./announcement.service");
const student_service_1 = require("../student/student.service");
const announcement_validation_1 = require("./announcement.validation");
const announcementService = new announcement_service_1.AnnouncementService();
const studentService = new student_service_1.StudentService();
class AnnouncementController {
    async create(req, res) {
        try {
            const data = announcement_validation_1.createAnnouncementSchema.parse(req.body);
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
            const user = req.user;
            if (!user || !user.id)
                return res.status(401).json({ error: 'Unauthorized' });
            const collegeId = user.college_id;
            if (!collegeId)
                return res.status(400).json({ error: 'User does not belong to a college' });
            const announcement = await announcementService.create(cleanData, user.id, collegeId);
            res.status(201).json(announcement);
        }
        catch (error) {
            console.error('Announcement creation error:', error);
            res.status(400).json({ error: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const { page = 1, limit = 20, ...filters } = req.query;
            const user = req.user;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 20;
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
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getById(req, res) {
        try {
            const announcement = await announcementService.getById(req.params.id);
            if (!announcement)
                return res.status(404).json({ error: 'Not found' });
            res.json(announcement);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async update(req, res) {
        try {
            const data = announcement_validation_1.updateAnnouncementSchema.parse(req.body);
            const announcement = await announcementService.update(req.params.id, data);
            res.json(announcement);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async delete(req, res) {
        try {
            await announcementService.delete(req.params.id);
            res.json({ message: 'Deleted' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async bulkDelete(req, res) {
        try {
            const { ids } = req.body; // or validate with schema if strictly needed inside controller block, but typically done before or inline
            if (!ids || !Array.isArray(ids)) {
                return res.status(400).json({ error: "Invalid IDs provided" });
            }
            await announcementService.bulkDelete(ids);
            res.json({ message: 'Bulk deleted successfully', count: ids.length });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.AnnouncementController = AnnouncementController;
//# sourceMappingURL=announcement.controller.js.map