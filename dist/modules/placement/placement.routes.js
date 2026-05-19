"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const placement_controller_1 = require("./placement.controller");
const router = (0, express_1.Router)();
const placementController = new placement_controller_1.PlacementController();
router.post('/', placementController.create);
router.get('/', placementController.getAll);
router.get('/student/:studentId', placementController.getByStudent);
exports.default = router;
//# sourceMappingURL=placement.routes.js.map