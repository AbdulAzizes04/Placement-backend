
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'shaikazizes04@gmail.com';
    const newPassword = 'shaik04';

    console.log(`Resetting password for ${email}...`);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.updateMany({
        where: { email: email },
        data: {
            password: hashedPassword,
            mustChangePassword: true
        }
    });

    console.log('Password reset to "shaik04" and mustChangePassword set to true.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
