"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const announcement_controller_1 = require("./announcement.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
const announcementController = new announcement_controller_1.AnnouncementController();
const isTPOOrAdmin = (0, role_middleware_1.authorize)(constants_1.ROLES.ADMIN, constants_1.ROLES.TPO);
// Public/Authenticated Reads
router.get('/', announcementController.getAll);
router.get('/:id', announcementController.getById);
// Protected Writes
router.post('/', auth_middleware_1.authenticate, isTPOOrAdmin, announcementController.create);
router.put('/:id', auth_middleware_1.authenticate, isTPOOrAdmin, announcementController.update);
router.post('/bulk-delete', auth_middleware_1.authenticate, isTPOOrAdmin, announcementController.bulkDelete);
router.delete('/:id', auth_middleware_1.authenticate, isTPOOrAdmin, announcementController.delete);
exports.default = router;
//# sourceMappingURL=announcement.routes.js.map