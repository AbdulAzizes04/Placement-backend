"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../config/prisma"));
class AuthService {
    async register(data) {
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                phone: data.phone ?? null,
                role: data.role,
                college_id: data.college_id,
                username: null, // Default username to null for non-students or explicit register
                mustChangePassword: false
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                college_id: true,
                created_at: true,
            },
        });
        return user;
    }
    async login(data) {
        const { identifier, password } = data;
        // 2️⃣ Authentication Update: Support Email OR Username
        const user = await prisma_1.default.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            },
            include: {
                faculty_profile: true
            }
        });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, faculty_profile, ...baseUser } = user;
        // Extract first branch as managedBranch for legacy frontend support
        const managedBranch = faculty_profile?.assignedBranches?.[0] || null;
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            role: user.role,
            email: user.email,
            username: user.username,
            college_id: user.college_id,
            managedBranch // Also include in token
        }, process.env.JWT_SECRET || 'fallback_secret_needs_change', { expiresIn: '7d' });
        return {
            user: {
                ...baseUser,
                managedBranch
            },
            token
        };
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user || !(await bcryptjs_1.default.compare(oldPassword, user.password))) {
            throw new Error('Invalid old password');
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                mustChangePassword: false
            },
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map