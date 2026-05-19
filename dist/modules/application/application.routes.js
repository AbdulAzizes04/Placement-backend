"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const application_controller_1 = require("./application.controller");
const router = (0, express_1.Router)();
const applicationController = new application_controller_1.ApplicationController();
router.post('/apply', applicationController.apply);
router.get('/my', applicationController.getMyApplications);
router.put('/:id/status', applicationController.updateStatus);
router.get('/', applicationController.getAll);
exports.default = router;
//# sourceMappingURL=application.routes.js.map