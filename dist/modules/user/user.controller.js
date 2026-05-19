"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const user_validation_1 = require("./user.validation");
const userService = new user_service_1.UserService();
class UserController {
    async getProfile(req, res) {
        try {
            const user = await userService.getUserById(req.user.id);
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async updateProfile(req, res) {
        try {
            const data = user_validation_1.updateUserSchema.parse(req.body);
            const user = await userService.updateUser(req.user.id, data);
            res.json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getAllUsers(req, res) {
        try {
            const users = await userService.getAllUsers();
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map