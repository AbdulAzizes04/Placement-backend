"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrfProtection = void 0;
const crypto_1 = __importDefault(require("crypto"));
// Double Submit Cookie Pattern
// 1. GET requests: Generate token if missing, set as cookie (accessible to JS).
// 2. POST/PUT/DELETE: Require header 'X-XSRF-TOKEN' to match the cookie 'XSRF-TOKEN'.
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';
const IGNORE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const csrfProtection = (req, res, next) => {
    // 1. Ensure Token Exists (Set on valid GET requests or Entry points)
    // We'll regenerate it if missing or on login.
    // For simplicity, we ensure it exists on every request.
    // Guard against cookie-parser failing or not running
    if (!req.cookies) {
        console.warn("Usage Warning: req.cookies is undefined. Initializing empty object.");
        req.cookies = {};
    }
    let token = req.cookies[CSRF_COOKIE_NAME];
    if (!token) {
        token = crypto_1.default.randomBytes(32).toString('hex');
        const isProduction = process.env.NODE_ENV === 'production';
        try {
            res.cookie(CSRF_COOKIE_NAME, token, {
                httpOnly: false, // Must be readable by Frontend JS to set header
                secure: isProduction,
                sameSite: 'lax',
                path: '/'
            });
        }
        catch (err) {
            console.error("Error setting CSRF cookie:", err);
            return res.status(500).json({ message: "Internal Server Error: Failed to set CSRF cookie" });
        }
    }
    // 2. Validate on State-Changing Methods
    if (!IGNORE_METHODS.includes(req.method)) {
        const headerToken = req.headers[CSRF_HEADER_NAME.toLowerCase()] || req.headers[CSRF_HEADER_NAME] || req.get(CSRF_HEADER_NAME);
        if (!headerToken || headerToken !== token) {
            // console.warn('CSRF Attack Detected:', {
            //     ip: req.ip, 
            //     method: req.method, 
            //     path: req.originalUrl,
            //     cookieToken: token ? 'present' : 'missing',
            //     headerToken: headerToken ? 'present' : 'missing'
            // });
            return res.status(403).json({ message: 'CSRF Token Validation Failed', code: 'CSRF_ERROR' });
        }
    }
    next();
};
exports.csrfProtection = csrfProtection;
//# sourceMappingURL=csrf.middleware.js.map