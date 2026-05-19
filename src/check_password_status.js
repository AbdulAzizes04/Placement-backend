const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'shaikazizes04@gmail.com';
    const user = await prisma.user.findFirst({
        where: { email }
    });

    if (!user) {
        console.error('User not found!');
        process.exit(1);
    }

    console.log('User status:');
    console.log('mustChangePassword:', user.mustChangePassword);
    console.log('updatedAt:', user.updatedAt);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
