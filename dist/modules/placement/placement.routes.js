"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const placement_controller_1 = require("./placement.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
const placementController = new placement_controller_1.PlacementController();
// Apply authentication to all routes
router.use(auth_middleware_1.authenticate);
const isTPOOrAdmin = (0, role_middleware_1.authorize)(constants_1.ROLES.ADMIN, constants_1.ROLES.TPO);
// Protect Write Operations
router.post('/', isTPOOrAdmin, placementController.create);
// Read Operations
router.get('/', isTPOOrAdmin, placementController.getAll);
router.get('/student/:studentId', placementController.getByStudent);
exports.default = router;
//# sourceMappingURL=placement.routes.js.map