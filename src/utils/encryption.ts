
import crypto from 'crypto';
import { env } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Recommended for GCM
const AUTH_TAG_LENGTH = 16;

// Ensure key is 32 bytes (256 bits). If env key is short, pad or hash it. 
// For production, this should be a properly managed secret.
const KEY = crypto.createHash('sha256').update(env.JWT_SECRET).digest();

export const encrypt = (text: string): string => {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

export const decrypt = (text: string): string => {
    if (!text || !text.includes(':')) return text; // Return as-is if not encrypted format

    const [ivHex, authTagHex, encryptedHex] = text.split(':');
    if (!ivHex || !authTagHex || !encryptedHex) return text;

    try {
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        // Return original text if decryption fails (graceful handling for legacy plaintext)
        // console.error('Decryption failed:', error.message);
        return text;
    }
};

// Deterministic hash for lookups (Blind Index)
export const hash = (text: string): string => {
    if (!text) return text;
    return crypto.createHmac('sha256', KEY).update(text).digest('hex');
};
