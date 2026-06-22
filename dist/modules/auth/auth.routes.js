"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
const rateLimit_middleware_1 = require("../../middlewares/rateLimit.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
router.post('/register', authController.register);
router.post('/login', rateLimit_middleware_1.loginLimiter, authController.login);
router.post('/change-password', auth_middleware_1.authenticate, authController.changePassword);
router.post('/reset-password', authController.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map