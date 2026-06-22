"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const batches_controller_1 = require("../controllers/batches.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const constants_1 = require("../config/constants");
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(auth_middleware_1.authenticate);
// Restricted Routes (Admin & TPO)
const isTPOOrAdmin = (0, role_middleware_1.authorize)(constants_1.ROLES.ADMIN, constants_1.ROLES.TPO);
router.post('/import', isTPOOrAdmin, batches_controller_1.importBatches);
router.post('/create-from-csv', isTPOOrAdmin, batches_controller_1.createBatchFromCSV);
router.post('/allocate', isTPOOrAdmin, batches_controller_1.allocateBatches);
router.post('/availability', isTPOOrAdmin, batches_controller_1.checkAvailability);
router.post('/delete-all', isTPOOrAdmin, batches_controller_1.deleteAllBatches);
router.get('/', isTPOOrAdmin, batches_controller_1.getBatches);
router.get('/branch-stats', isTPOOrAdmin, batches_controller_1.getBranchStats);
router.post('/unassign', isTPOOrAdmin, batches_controller_1.unassignStudent);
router.get('/:id', isTPOOrAdmin, batches_controller_1.getBatchById);
router.delete('/:id', isTPOOrAdmin, batches_controller_1.deleteBatch);
router.get('/:id/export', isTPOOrAdmin, batches_controller_1.exportBatch);
exports.default = router;
//# sourceMappingURL=batches.routes.js.map