
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
    const email = 'dinesh@example.com';
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });
        console.log(`Password for ${user.email} has been reset to '${newPassword}'.`);
        console.log(`User Details: Role=${user.role}, IsDeleted=${user.is_deleted}`);
    } catch (error) {
        console.error(`Failed to update password for ${email}. User might not exist.`);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
