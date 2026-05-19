import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import studentRoutes from './modules/student/student.routes';
import announcementRoutes from './modules/announcement/announcement.routes';
import applicationRoutes from './modules/application/application.routes';
import placementRoutes from './modules/placement/placement.routes';
import crtRoutes from './modules/crt/crt.routes';
import batchRoutes from './routes/batches.routes';
import facultyRoutes from './routes/faculty.routes';
import { errorHandler } from './middlewares/error.middleware';
import { softDeleteFilter } from './middlewares/softDelete.middleware';

import { apiLimiter } from './middlewares/rateLimit.middleware';

const app = express();
app.disable('x-powered-by');

import { requestLogger } from './middlewares/requestLogger.middleware';

// Middlewares
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    process.env.FRONTEND_URL || "https://your-frontend.onrender.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN']
}));

app.use(helmet({
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
app.use(apiLimiter);
app.use(requestLogger);
app.use(cookieParser());
import { csrfProtection } from './middlewares/csrf.middleware';
app.use(csrfProtection); // 🔒 CSRF Protection Global Middleware

app.use(express.json({ limit: '2gb' })); // Increased limit for heavy bulk operations
app.use(express.urlencoded({ extended: true, limit: '2gb' }));
app.use(softDeleteFilter);

// Routes
// Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// CSRF Initialization Endpoint
app.get('/api/csrf-token', (req, res) => {
  // The middleware already set the cookie if missing
  res.json({ message: "CSRF Token Set" });
});

// Global Authentication Barrier
import { authenticate } from './middlewares/auth.middleware';
app.use(authenticate);

// Protected Routes
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/crt', crtRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/faculty', facultyRoutes);

// Error handling
app.use(errorHandler);

export default app;