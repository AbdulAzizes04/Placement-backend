
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'dinesh@example.com';
    const user = await prisma.user.findFirst({
        where: { email },
    });

    if (user) {
        console.log(`User found: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Password Hash: ${user.password.substring(0, 10)}...`);
        // Check if it matches the default seed password hash if known, or just inform user it's hashed.
        // The seed file uses bcrypt.hash('password123', 10).
    } else {
        console.log(`User with email ${email} not found.`);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
