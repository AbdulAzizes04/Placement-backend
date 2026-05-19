"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
router.get('/profile', auth_middleware_1.authenticate, userController.getProfile);
router.put('/profile', auth_middleware_1.authenticate, userController.updateProfile);
router.get('/', auth_middleware_1.authenticate, role_middleware_1.isAdmin, userController.getAllUsers);
exports.default = router;
//# sourceMappingURL=user.routes.js.map