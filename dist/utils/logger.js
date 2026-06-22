"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, json, printf, colorize } = winston_1.default.format;
// Custom format for console logging (easier to read during dev)
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message} `;
    if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata);
    }
    return msg;
});
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp(), json() // Default to JSON for easy parsing (Splunk, ELK, etc.)
    ),
    transports: [
        new winston_1.default.transports.File({ filename: 'app.log' }), // Persist logs
        new winston_1.default.transports.Console({
            format: combine(colorize(), consoleFormat)
        })
    ],
});
//# sourceMappingURL=logger.js.map