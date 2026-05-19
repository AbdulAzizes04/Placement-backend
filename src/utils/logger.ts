
import winston from 'winston';

const { combine, timestamp, json, printf, colorize } = winston.format;

// Custom format for console logging (easier to read during dev)
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message} `;
    if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata);
    }
    return msg;
});

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp(),
        json() // Default to JSON for easy parsing (Splunk, ELK, etc.)
    ),
    transports: [
        new winston.transports.File({ filename: 'app.log' }), // Persist logs
        new winston.transports.Console({
            format: combine(
                colorize(),
                consoleFormat
            )
        })
    ],
});
