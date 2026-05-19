"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class UserService {
    async getUserById(id) {
        return await prisma_1.default.user.findUnique({
            where: { id, is_deleted: false },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                created_at: true,
            },
        });
    }
    async updateUser(id, data) {
        return await prisma_1.default.user.update({
            where: { id },
            data,
        });
    }
    async getAllUsers() {
        return await prisma_1.default.user.findMany({
            where: { is_deleted: false },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                created_at: true,
            },
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map