import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching users...");
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            name: true,
            // password: true // Don't log password hash
        }
    });
    console.log('Users found:', users);

    if (users.length === 0) {
        console.log("No users found. You might need to seed the database.");
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
