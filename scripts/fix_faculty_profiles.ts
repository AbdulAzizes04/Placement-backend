
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting faculty profile fix...');

    const staffEmail = 'staff@example.com';
    const tpoEmail = 'tpo1@example.com';

    const users = await prisma.user.findMany({
        where: {
            email: { in: [staffEmail, tpoEmail] }
        }
    });

    for (const user of users) {
        console.log(`Checking profile for ${user.name} (${user.email})...`);

        let branch = 'CSE'; // Default for these test users
        if (user.email === tpoEmail) branch = 'CSE'; // TPO1 also CSE for testing

        await prisma.facultyProfile.upsert({
            where: { user_id: user.id },
            update: {
                assignedBranches: [branch],
                assignedBatches: ['2022-2026', '2023-2027']
            },
            create: {
                user_id: user.id,
                name: user.name,
                email: user.email || '',
                assignedBranches: [branch],
                assignedBatches: ['2022-2026', '2023-2027']
            }
        });
        console.log(`Updated faculty profile for ${user.name} with branch ${branch}.`);
    }

    console.log('Faculty profile fix completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
