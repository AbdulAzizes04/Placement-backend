
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { encrypt, hash } from '../src/utils/encryption';

const prisma = new PrismaClient();

async function main() {
    const email = 'student@example.com';
    const rollNo = '2024CSE001';
    const password = rollNo; // User Requirement: Roll No as Password
    const hashedPassword = await bcrypt.hash(password, 10);


    // Hash rollNo and Email
    // Note: encryption utils might depend on env vars. 
    // If they fail, we might need to mock them or ensure .env is loaded.
    // The previous scripts worked so .env is likely loaded by ts-node-dev or automatically.

    // Check if exists
    // We need to use hash values for lookups
    // encryption.ts uses process.env.ENCRYPTION_KEY.
    // Let's hope it's picked up.

    console.log("Creating/Updating user...");

    // 1. Ensure College
    let college = await prisma.college.findFirst({ where: { code: 'EXU' } });
    if (!college) {
        college = await prisma.college.create({
            data: { name: 'Example University', code: 'EXU' }
        });
    }

    const emailHash = hash(email);
    let user = await prisma.user.findFirst({ where: { email_hash: emailHash } });

    if (!user) {
        user = await prisma.user.create({
            data: {
                name: 'Test Student',
                email: encrypt(email),
                email_hash: emailHash,
                password: hashedPassword,
                role: 'STUDENT',
                college_id: college.id,
                username: encrypt(rollNo),
                username_hash: hash(rollNo),
                mustChangePassword: true // Enforce Password Change
            }
        });
        console.log(`User created: ${email}`);
    } else {
        console.log(`User already exists: ${email}`);
        // Reset password to RollNo and enforce change
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                mustChangePassword: true
            }
        });
        console.log("User password reset to RollNo and forced change.");
    }

    // 2. Ensure Profile
    let profile = await prisma.studentProfile.findUnique({ where: { user_id: user.id } });
    if (!profile) {
        profile = await prisma.studentProfile.create({
            data: {
                user_id: user.id,
                college_id: college.id,
                roll_no: encrypt(rollNo),
                roll_no_hash: hash(rollNo),
                branch: 'CSE',
                year: 4,
                cgpa: 8.5,
                batch: '2022-2026',
                status: 'Unplaced',
                is_crt: true // Important for CRT access
            }
        });
        console.log("Profile created.");
    } else {
        console.log("Profile already exists.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
