"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const application_service_1 = require("./application.service");
const application_validation_1 = require("./application.validation");
const applicationService = new application_service_1.ApplicationService();
class ApplicationController {
    async apply(req, res) {
        try {
            const { announcement_id } = application_validation_1.applySchema.parse(req.body);
            const application = await applicationService.apply(req.user.student_profile.id, announcement_id);
            res.status(201).json(application);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getMyApplications(req, res) {
        try {
            const applications = await applicationService.getApplications(req.user.student_profile.id);
            res.json(applications);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async updateStatus(req, res) {
        try {
            console.log(`[ApplicationController] Updating status for ID: ${req.params.id} with body:`, req.body);
            const { status } = application_validation_1.updateStatusSchema.parse(req.body);
            const application = await applicationService.updateStatus(req.params.id, status);
            console.log(`[ApplicationController] Update successful for ID: ${req.params.id}`, application);
            res.json(application);
        }
        catch (error) {
            console.error(`[ApplicationController] Update failed for ID: ${req.params.id}`, error);
            res.status(400).json({ error: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const { page = 1, limit = 50, ...filters } = req.query;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 50;
            const result = await applicationService.getAll(filters, pageNum, limitNum);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.ApplicationController = ApplicationController;
//# sourceMappingURL=application.controller.js.map