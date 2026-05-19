import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugPlacements() {
    console.log("Debugging Placement Records...");

    const placements = await prisma.placementRecord.findMany({
        take: 5,
        include: {
            student: {
                include: { user: true }
            }
        }
    });

    console.log(`Fetched ${placements.length} sample records.`);

    placements.forEach((p, i) => {
        console.log(`\n--- Record ${i + 1} ---`);
        console.log(`ID: ${p.id}`);
        console.log(`Student ID: ${p.student_id}`);
        console.log(`Student Relation:`, p.student ? "Present" : "MISSING");

        if (p.student) {
            console.log(`  Profile ID: ${p.student.id}`);
            console.log(`  Roll No: ${p.student.roll_no}`);
            console.log(`  Branch: ${p.student.branch}`);
            console.log(`  User Relation:`, p.student.user ? "Present" : "MISSING");
            if (p.student.user) {
                console.log(`    Name: ${p.student.user.name}`);
                console.log(`    Email: ${p.student.user.email}`);
            }
        }
    });
}

debugPlacements()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
