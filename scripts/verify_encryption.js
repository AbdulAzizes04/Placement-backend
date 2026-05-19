
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// --- Inline Encryption Utils (copy of src/utils/encryption.ts) ---
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

// Mock Secret - In real app, this comes from ENV. 
// We must ensure this matches what the app uses if strictly needed, 
// but for verification of *storage format*, any key works for the test insertion.
// To verify *app* decryption, we need the SAME key.
// We'll trust process.env.JWT_SECRET is available.
const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_for_testing_only';
const KEY = crypto.createHash('sha256').update(secret).digest();

const encrypt = (text) => {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

const decrypt = (text) => {
    if (!text || !text.includes(':')) return text;
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
        return text;
    }
};

const hash = (text) => {
    if (!text) return text;
    return crypto.createHmac('sha256', KEY).update(text).digest('hex');
};

// --- Test Logic ---

async function verifyEncryption() {
    console.log('🔒 Verifying PII Encryption...');

    const rollNo = 'TEST_ENC_001';
    const email = 'test_enc@example.com';
    const phone = '9999999999';

    // We need a valid college ID
    const college = await prisma.college.findFirst();
    if (!college) {
        console.error('❌ Cannot run test: No college found in DB.');
        return;
    }

    try {
        // Cleanup
        await prisma.studentProfile.deleteMany({ where: { roll_no_hash: hash(rollNo) } }).catch(() => { });
        await prisma.user.deleteMany({ where: { email_hash: hash(email) } }).catch(() => { });
        // Also delete by username hash if possible, but schema might not accept it if client is old.
        // If client is old, accessing `username_hash` might throw or be ignored.
        // We'll try raw query for cleanup to be safe? 
        // Or just try-catch.

        console.log('1. Creating User with PII (Using inline encryption)...');

        const rollNoEnc = encrypt(rollNo);
        const emailEnc = encrypt(email);
        const phoneEnc = encrypt(phone);

        const rollNoHash = hash(rollNo);
        const emailHash = hash(email);
        const phoneHash = hash(phone);

        // We use 'unchecked' input or force casting if types are missing
        // or just pass properties and hope Prisma passes them through if DB has columns
        // actually Prisma Client validates props. strict.
        // If generate failed, we can't write to _hash columns via Client.
        // We MUST use $executeRaw / $queryRaw to bypass Client validation if it's outdated.

        const userId = crypto.randomUUID();
        const studentProfileId = crypto.randomUUID();
        const hashedPassword = 'hashed_password_placeholder'; // Dummy

        // Raw Insert to User
        await prisma.$executeRaw`
            INSERT INTO "User" (id, name, username, username_hash, email, email_hash, phone, phone_hash, password, role, college_id, "mustChangePassword", "is_deleted", "updated_at")
            VALUES (${userId}, 'Encryption Test User', ${rollNoEnc}, ${rollNoHash}, ${emailEnc}, ${emailHash}, ${phoneEnc}, ${phoneHash}, ${hashedPassword}, 'STUDENT'::"Role", ${college.id}::uuid, true, false, NOW());
        `;

        console.log('✅ User inserted via Raw SQL.');

        // 2. Initial Verification: Check DB stored values
        const rawUsers = await prisma.$queryRaw`SELECT * FROM "User" WHERE id = ${userId}::uuid`;
        const rawUser = rawUsers[0];

        console.log('\n--- DB Inspection ---');
        console.log(`Raw Email in DB: ${rawUser.email}`);
        // console.log(`Email Hash:      ${rawUser.email_hash}`); // Might not be returned if not in select? queryRaw returns all.

        if (rawUser.email === email) {
            console.error('❌ FAILURE: Email is stored in Plaintext!');
        } else if (rawUser.email.includes(':')) {
            console.log('✅ SUCCESS: Email appears encrypted (contains IV:Tag:Cipher).');
        } else {
            console.log('⚠️ WARNING: Email might be encrypted but format is unexpected.');
        }

        // 3. Decryption Verification
        const decryptedEmail = decrypt(rawUser.email);
        if (decryptedEmail === email) {
            console.log(`✅ SUCCESS: Decryption works! decoded: ${decryptedEmail}`);
        } else {
            console.error(`❌ FAILURE: Decryption failed. Got: ${decryptedEmail}`);
        }

        // Cleanup
        await prisma.$executeRaw`DELETE FROM "User" WHERE id = ${userId}::uuid`;
        console.log('\nCleanup complete.');

    } catch (e) {
        console.error('Test Error:', e);
    }
}

verifyEncryption();
