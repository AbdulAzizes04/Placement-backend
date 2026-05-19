"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const announcement_controller_1 = require("./announcement.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const announcementController = new announcement_controller_1.AnnouncementController();
router.post('/', auth_middleware_1.authenticate, announcementController.create);
router.get('/', announcementController.getAll);
router.get('/:id', announcementController.getById);
router.put('/:id', auth_middleware_1.authenticate, announcementController.update);
router.post('/bulk-delete', auth_middleware_1.authenticate, announcementController.bulkDelete);
router.delete('/:id', auth_middleware_1.authenticate, announcementController.delete);
exports.default = router;
//# sourceMappingURL=announcement.routes.js.map