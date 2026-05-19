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
        next();
    }
    catch (error) {
        console.error("Debug Middleware: Token Verification Failed:", error.message);
        res.status(401).json({ message: 'Invalid token.', error: error.message });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map