"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("../utils/logger");
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const user = req.user;
        logger_1.logger.info('HTTP Request', {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            user_id: user?.id || 'anonymous',
            role: user?.role || 'guest',
            user_agent: req.get('user-agent')
        });
    });
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.middleware.js.map