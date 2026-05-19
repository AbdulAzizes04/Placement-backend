
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting AIML random placement seeding...');

    const branch = 'AIML';

    // Fetch all "Not placed" students in AIML
    // Also check for "Unplaced" just in case of inconsistency
    const students = await prisma.studentProfile.findMany({
        where: {
            branch,
            status: { in: ['Not placed', 'Unplaced'] }
        },
        select: { id: true, user_id: true }
    });

    console.log(`Found ${students.length} eligible students in AIML.`);

    // Randomize and pick up to 50
    const shuffled = students.sort(() => 0.5 - Math.random());
    const toPlace = shuffled.slice(0, 50);

    console.log(`Setting ${toPlace.length} AIML students to "Placed"...`);

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
                    company_name: 'AIML Specialists Ltd',
                    package: Math.round((6 + Math.random() * 10) * 10) / 10, // 6-16 LPA
                    placed_at: new Date(),
                }
            })
        ]);
    }

    console.log('AIML random placement seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
