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
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app = (0, express_1.default)();
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
// Middlewares
app.use((0, helmet_1.default)());
app.use(limiter);
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        process.env.FRONTEND_URL || "https://your-frontend.onrender.com"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: '2gb' })); // Increased limit for heavy bulk operations
app.use(express_1.default.urlencoded({ extended: true, limit: '2gb' }));
app.use(softDelete_middleware_1.softDeleteFilter);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
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