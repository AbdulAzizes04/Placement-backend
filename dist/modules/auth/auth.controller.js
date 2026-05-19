"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const auth_validation_1 = require("./auth.validation");
const zod_1 = require("zod");
const authService = new auth_service_1.AuthService();
class AuthController {
    async register(req, res) {
        try {
            const data = auth_validation_1.registerSchema.parse(req.body);
            const user = await authService.register(data);
            res.status(201).json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async login(req, res) {
        try {
            // Schema now transforms email -> identifier locally if needed
            const { identifier, password } = auth_validation_1.loginSchema.parse(req.body);
            if (!identifier) {
                return res.status(400).json({ error: "Email or Username is required" });
            }
            const result = await authService.login({ identifier, password });
            // Set secure cookie
            res.cookie("token", result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // false in dev
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.json(result);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.errors[0].message });
            }
            console.error("Login Error:", error);
            res.status(401).json({ error: error.message });
        }
    }
    async changePassword(req, res) {
        try {
            const { oldPassword, newPassword } = auth_validation_1.changePasswordSchema.parse(req.body);
            await authService.changePassword(req.user.id, oldPassword, newPassword);
            res.json({ message: 'Password changed' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map