"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const application_service_1 = require("./application.service");
const application_validation_1 = require("./application.validation");
const applicationService = new application_service_1.ApplicationService();
const catchAsync_1 = require("../../utils/catchAsync");
class ApplicationController {
    constructor() {
        this.apply = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const { announcement_id } = application_validation_1.applySchema.parse(req.body);
            const application = await applicationService.apply(req.user.student_profile.id, announcement_id);
            res.status(201).json(application);
        });
        this.getMyApplications = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const applications = await applicationService.getApplications(req.user.student_profile.id);
            res.json(applications);
        });
        this.updateStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
            console.log(`[ApplicationController] Updating status for ID: ${req.params.id} with body:`, req.body);
            const { status } = application_validation_1.updateStatusSchema.parse(req.body);
            const application = await applicationService.updateStatus(req.params.id, status);
            console.log(`[ApplicationController] Update successful for ID: ${req.params.id}`, application);
            res.json(application);
        });
        this.getAll = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const { page = 1, limit = 50, ...filters } = req.query;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 50;
            const result = await applicationService.getAll(filters, pageNum, limitNum);
            // Standardizing pagination response format to { data, meta }
            // If result already has 'data' and 'meta', we just pass it down. 
            // If it has 'applications', we map it to 'data'.
            const data = result.applications || result.data || result;
            const meta = result.meta || undefined;
            res.json({ data, meta });
        });
        this.bulkUpdate = (0, catchAsync_1.catchAsync)(async (req, res) => {
            console.log(`[ApplicationController] Bulk updating statuses`, req.body);
            const { company_name, updates } = application_validation_1.bulkUpdateStatusSchema.parse(req.body);
            const result = await applicationService.bulkUpdateStatuses(company_name, updates);
            res.json(result);
        });
    }
}
exports.ApplicationController = ApplicationController;
//# sourceMappingURL=application.controller.js.map