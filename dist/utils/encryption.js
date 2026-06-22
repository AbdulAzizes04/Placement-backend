"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Recommended for GCM
const AUTH_TAG_LENGTH = 16;
// Ensure key is 32 bytes (256 bits). If env key is short, pad or hash it. 
// For production, this should be a properly managed secret.
const KEY = crypto_1.default.createHash('sha256').update(env_1.env.JWT_SECRET).digest();
const encrypt = (text) => {
    if (!text)
        return text;
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};
exports.encrypt = encrypt;
const decrypt = (text) => {
    if (!text || !text.includes(':'))
        return text; // Return as-is if not encrypted format
    const [ivHex, authTagHex, encryptedHex] = text.split(':');
    if (!ivHex || !authTagHex || !encryptedHex)
        return text;
    try {
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto_1.default.createDecipheriv(ALGORITHM, KEY, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        // Return original text if decryption fails (graceful handling for legacy plaintext)
        // console.error('Decryption failed:', error.message);
        return text;
    }
};
exports.decrypt = decrypt;
// Deterministic hash for lookups (Blind Index)
const hash = (text) => {
    if (!text)
        return text;
    return crypto_1.default.createHmac('sha256', KEY).update(text).digest('hex');
};
exports.hash = hash;
//# sourceMappingURL=encryption.js.map