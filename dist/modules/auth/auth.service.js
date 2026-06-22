"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const encryption_1 = require("../../utils/encryption");
class AuthService {
    async register(data) {
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const emailHash = data.email ? (0, encryption_1.hash)(data.email) : undefined;
        // Check Email Duplicate (Blind Index)
        if (emailHash) {
            const existing = await prisma_1.default.user.findFirst({ where: { email_hash: emailHash } });
            if (existing)
                throw new Error("Email already in use");
        }
        const user = await prisma_1.default.user.create({
            data: {
                name: data.name,
                email: data.email ? (0, encryption_1.encrypt)(data.email) : null,
                email_hash: emailHash,
                password: hashedPassword,
                phone: data.phone ? (0, encryption_1.encrypt)(data.phone) : null,
                phone_hash: data.phone ? (0, encryption_1.hash)(data.phone) : null,
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
        // Decrypt return value
        return {
            ...user,
            email: (0, encryption_1.decrypt)(user.email || '')
        };
    }
    async login(data) {
        const { identifier, password } = data;
        const identifierHash = (0, encryption_1.hash)(identifier);
        // 2️⃣ Authentication Update: Support Email OR Username via Blind Index
        const user = await prisma_1.default.user.findFirst({
            where: {
                OR: [
                    { email_hash: identifierHash },
                    { username_hash: identifierHash }
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
        // Decrypt PII for Token and Response
        const decryptedEmail = (0, encryption_1.decrypt)(user.email || '');
        const decryptedUsername = (0, encryption_1.decrypt)(user.username || '');
        const decryptedPhone = user.phone ? (0, encryption_1.decrypt)(user.phone) : null;
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            role: user.role,
            email: decryptedEmail,
            username: decryptedUsername,
            phone: decryptedPhone, // Add phone to token if needed, or just return in user object
            college_id: user.college_id,
            managedBranch, // Also include in token
            mustChangePassword: user.mustChangePassword // Critical Security Flag
        }, process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET is not defined"); })(), { expiresIn: '7d' });
        return {
            user: {
                ...baseUser,
                email: decryptedEmail,
                username: decryptedUsername,
                phone: decryptedPhone,
                managedBranch
            },
            token
        };
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { faculty_profile: true }
        });
        if (!user || !(await bcryptjs_1.default.compare(oldPassword, user.password))) {
            throw new Error('Invalid old password');
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update password and reset flag
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                mustChangePassword: false
            },
            include: { faculty_profile: true }
        });
        // Generate new token with updated mustChangePassword flag
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, faculty_profile, ...baseUser } = updatedUser;
        const managedBranch = faculty_profile?.assignedBranches?.[0] || null;
        const decryptedEmail = (0, encryption_1.decrypt)(updatedUser.email || '');
        const decryptedUsername = (0, encryption_1.decrypt)(updatedUser.username || '');
        const token = jsonwebtoken_1.default.sign({
            id: updatedUser.id,
            role: updatedUser.role,
            email: decryptedEmail,
            username: decryptedUsername,
            college_id: updatedUser.college_id,
            managedBranch,
            mustChangePassword: false // Explicitly false now
        }, process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET is not defined"); })(), { expiresIn: '7d' });
        return {
            user: {
                ...baseUser,
                email: decryptedEmail,
                username: decryptedUsername,
                managedBranch
            },
            token
        };
    }
    async resetPasswordDirect(identifier, newPassword) {
        const identifierHash = (0, encryption_1.hash)(identifier);
        const user = await prisma_1.default.user.findFirst({
            where: {
                OR: [
                    { email_hash: identifierHash },
                    { username_hash: identifierHash }
                ]
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                mustChangePassword: false
            }
        });
        return { message: 'Password reset successfully' };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map