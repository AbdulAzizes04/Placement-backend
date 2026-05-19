"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faculty_controller_1 = require("../controllers/faculty.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Define routes
router.use(auth_middleware_1.authenticate); // Protect all routes
router.get('/', faculty_controller_1.getFacultyList);
router.get('/:id', faculty_controller_1.getFacultyById);
router.post('/', (0, role_middleware_1.authorize)('ADMIN'), faculty_controller_1.createFaculty);
router.put('/:id', (0, role_middleware_1.authorize)('ADMIN', 'TPO'), faculty_controller_1.updateFaculty);
router.delete('/:id', (0, role_middleware_1.authorize)('ADMIN'), faculty_controller_1.deleteFaculty);
exports.default = router;
//# sourceMappingURL=faculty.routes.js.map