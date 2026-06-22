"use strict";
/**
 * File Security Utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMagicBytes = exports.sanitizeCSV = void 0;
// 1. CSV Injection (Formula Injection) Defense
// Prevents malicious formulas from executing in Excel/Sheets when admin opens the CSV.
const sanitizeCSV = (data) => {
    const sanitizeValue = (value) => {
        if (typeof value === 'string') {
            // If starts with =, +, -, @, tab, or carriage return, prepend a single quote
            // to force it to be treated as text.
            if (/^[=+\-@\t\r]/.test(value)) {
                return `'${value}`;
            }
        }
        return value;
    };
    return data.map(row => {
        const sanitizedRow = {};
        for (const key in row) {
            sanitizedRow[key] = sanitizeValue(row[key]);
        }
        return sanitizedRow;
    });
};
exports.sanitizeCSV = sanitizeCSV;
// 2. Magic Bytes Validation (Example for common types)
const validateMagicBytes = (buffer, mimetype) => {
    if (!buffer || buffer.length < 4)
        return false;
    const hex = buffer.toString('hex', 0, 4).toUpperCase();
    // PDF: %PDF (25 50 44 46)
    if (mimetype === 'application/pdf' && hex.startsWith('25504446'))
        return true;
    // JPEG: FF D8 FF
    if ((mimetype === 'image/jpeg' || mimetype === 'image/jpg') && hex.startsWith('FFD8FF'))
        return true;
    // PNG: 89 50 4E 47
    if (mimetype === 'image/png' && hex.startsWith('89504E47'))
        return true;
    // Excel (XLSX/DOCX - Zip container): 50 4B 03 04
    if ((mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') && hex.startsWith('504B0304'))
        return true;
    // CSV has no magic bytes (text), so validation relies on content parsing.
    if (mimetype === 'text/csv' || mimetype === 'application/vnd.ms-excel')
        return true;
    return false;
};
exports.validateMagicBytes = validateMagicBytes;
//# sourceMappingURL=fileValidation.js.map