"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("./student.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
const studentController = new student_controller_1.StudentController();
// Protect all routes
router.use(auth_middleware_1.authenticate);
const isTvAdmin = (0, role_middleware_1.authorize)(constants_1.ROLES.ADMIN, constants_1.ROLES.TPO);
router.post('/create', isTvAdmin, studentController.createStudent);
router.post('/bulk', isTvAdmin, studentController.bulkCreate);
router.post('/profile', studentController.createProfile);
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);
router.get('/stats', (0, role_middleware_1.authorize)(constants_1.ROLES.ADMIN, constants_1.ROLES.TPO, constants_1.ROLES.STAFF), studentController.getStatistics);
router.get('/', (0, role_middleware_1.authorize)(constants_1.ROLES.ADMIN, constants_1.ROLES.TPO, constants_1.ROLES.STAFF), studentController.getAllStudents);
router.delete('/bulk', (0, role_middleware_1.authorize)(constants_1.ROLES.ADMIN), studentController.bulkDelete);
router.delete('/all', (0, role_middleware_1.authorize)(constants_1.ROLES.ADMIN), studentController.deleteAllStudents);
router.delete('/:id', (0, role_middleware_1.authorize)(constants_1.ROLES.ADMIN), studentController.deleteStudent);
exports.default = router;
//# sourceMappingURL=student.routes.js.map