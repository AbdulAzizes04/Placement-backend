import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting placement fix...');

    // 1. Find all 'PLACED' applications
    const placedApplications = await prisma.application.findMany({
        where: {
            status: 'PLACED',
        },
        include: {
            student: true,
            announcement: true,
        },
    });

    console.log(`Found ${placedApplications.length} placed applications.`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const app of placedApplications) {
        // 2. Check if a PlacementRecord already exists for this student and company
        const existingRecord = await prisma.placementRecord.findFirst({
            where: {
                student_id: app.student_id,
                company_name: app.announcement.company_name,
            },
        });

        if (existingRecord) {
            skippedCount++;
            continue;
        }

        // 3. Create PlacementRecord
        // Generate a random package between 4 and 20 LPA based on something or just random
        const randomPackage = Math.floor(Math.random() * (20 - 4 + 1) + 4);

        await prisma.placementRecord.create({
            data: {
                student_id: app.student_id,
                company_name: app.announcement.company_name,
                package: randomPackage,
                placed_at: new Date(), // Set to now, or app.updated_at if preferred
            },
        });
        createdCount++;
    }

    console.log(`Fix completed. Created: ${createdCount}, Skipped: ${skippedCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
