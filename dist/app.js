"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const student_routes_1 = __importDefault(require("./modules/student/student.routes"));
const announcement_routes_1 = __importDefault(require("./modules/announcement/announcement.routes"));
const application_routes_1 = __importDefault(require("./modules/application/application.routes"));
const placement_routes_1 = __importDefault(require("./modules/placement/placement.routes"));
const crt_routes_1 = __importDefault(require("./modules/crt/crt.routes"));
const batches_routes_1 = __importDefault(require("./routes/batches.routes"));
const faculty_routes_1 = __importDefault(require("./routes/faculty.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const softDelete_middleware_1 = require("./middlewares/softDelete.middleware");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const app = (0, express_1.default)();
app.disable('x-powered-by');
const requestLogger_middleware_1 = require("./middlewares/requestLogger.middleware");
// Middlewares
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "https://your-frontend.onrender.com"
        ];
        if (process.env.FRONTEND_URL) {
            allowedOrigins.push(process.env.FRONTEND_URL);
        }
        const isRenderSubdomain = origin.endsWith('.onrender.com');
        if (allowedOrigins.includes(origin) || isRenderSubdomain) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN']
}));
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.render.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    frameguard: {
        action: 'deny'
    },
    xPoweredBy: false
}));
app.use(rateLimit_middleware_1.apiLimiter);
app.use(requestLogger_middleware_1.requestLogger);
app.use((0, cookie_parser_1.default)());
const csrf_middleware_1 = require("./middlewares/csrf.middleware");
app.use(csrf_middleware_1.csrfProtection); // 🔒 CSRF Protection Global Middleware
app.use(express_1.default.json({ limit: '2gb' })); // Increased limit for heavy bulk operations
app.use(express_1.default.urlencoded({ extended: true, limit: '2gb' }));
app.use(softDelete_middleware_1.softDeleteFilter);
// Routes
// Public Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});
// CSRF Initialization Endpoint
app.get('/api/csrf-token', (req, res) => {
    // The middleware already set the cookie if missing
    res.json({ message: "CSRF Token Set" });
});
// Global Authentication Barrier
const auth_middleware_1 = require("./middlewares/auth.middleware");
app.use(auth_middleware_1.authenticate);
// Protected Routes
app.use('/api/users', user_routes_1.default);
app.use('/api/students', student_routes_1.default);
app.use('/api/announcements', announcement_routes_1.default);
app.use('/api/applications', application_routes_1.default);
app.use('/api/placements', placement_routes_1.default);
app.use('/api/crt', crt_routes_1.default);
app.use('/api/batches', batches_routes_1.default);
app.use('/api/faculty', faculty_routes_1.default);
// Error handling
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map