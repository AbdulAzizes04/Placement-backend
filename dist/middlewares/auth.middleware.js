"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        // console.log("Debug Middleware: Auth Header:", authHeader ? "Present" : "Missing");
        let token = authHeader?.replace('Bearer ', '');
        // Fallback to cookie if header is missing
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            console.log("Debug Middleware: Access Denied - No Token");
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = decoded;
        // 🔒 Security Hardening: Enforce Password Change
        if (decoded.mustChangePassword) {
            const allowedPath = '/api/auth/change-password';
            const currentPath = req.originalUrl.split('?')[0];
            console.log(`Debug Middleware: Checking Path for Password Change Enforce`);
            console.log(`Current Path: '${currentPath}'`);
            console.log(`Allowed Path: '${allowedPath}'`);
            console.log(`Match? ${currentPath === allowedPath}`);
            if (currentPath !== allowedPath) {
                return res.status(403).json({
                    message: 'Security Alert: You must change your password to proceed.',
                    code: 'PASSWORD_CHANGE_REQUIRED'
                });
            }
        }
        next();
    }
    catch (error) {
        console.error("Debug Middleware: Token Verification Failed:", error.message);
        res.status(401).json({ message: 'Invalid token.', error: error.message });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map