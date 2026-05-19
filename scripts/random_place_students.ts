
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting random placement seeding...');

    const branches = await prisma.studentProfile.findMany({
        select: { branch: true },
        distinct: ['branch'],
    });

    for (const { branch } of branches) {
        console.log(`Processing branch: ${branch}`);

        // Fetch all unplaced students in this branch
        const students = await prisma.studentProfile.findMany({
            where: {
                branch,
                status: 'Unplaced'
            },
            select: { id: true, user_id: true }
        });

        console.log(`  Found ${students.length} unplaced students.`);

        // Randomize and pick up to 150
        const shuffled = students.sort(() => 0.5 - Math.random());
        const toPlace = shuffled.slice(0, 150);

        console.log(`  Setting ${toPlace.length} students to "Placed"...`);

        for (const student of toPlace) {
            await prisma.$transaction([
                // 1. Update Profile Status
                prisma.studentProfile.update({
                    where: { id: student.id },
                    data: { status: 'Placed' }
                }),
                // 2. Create a dummy placement record if none exists
                prisma.placementRecord.create({
                    data: {
                        student_id: student.id,
                        company_name: 'Example Tech Corp',
                        package: Math.round((4 + Math.random() * 8) * 10) / 10, // 4-12 LPA
                        placed_at: new Date(),
                    }
                })
            ]);
        }
    }

    console.log('Random placement seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
