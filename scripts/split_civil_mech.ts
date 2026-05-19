
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting migration: Splitting CIVIL/MECH branch...");

    // Find all students in CIVIL/MECH
    const students = await prisma.studentProfile.findMany({
        where: {
            branch: 'CIVIL/MECH'
        }
    });

    console.log(`Found ${students.length} students in CIVIL/MECH branch.`);

    let civilCount = 0;
    let mechCount = 0;
    let skippedCount = 0;

    for (const student of students) {
        const rollNo = student.roll_no;
        // Extract last 4 digits
        const match = rollNo.match(/(\d{4})$/);

        if (!match) {
            console.warn(`Skipping student ${student.id} (${rollNo}): Could not parse roll number sequence.`);
            skippedCount++;
            continue;
        }

        const seq = parseInt(match[1], 10);

        if (seq >= 3001 && seq <= 3125) {
            // CIVIL
            await prisma.studentProfile.update({
                where: { id: student.id },
                data: { branch: 'CIVIL' }
            });
            civilCount++;
        } else if (seq >= 3126 && seq <= 3300) {
            // MECH
            // Replace CIV with MEC is case insensitive or specific? 
            // User example: 22CIV3126 -> 22MEC3126
            const newRollNo = rollNo.replace('CIV', 'MEC');

            await prisma.studentProfile.update({
                where: { id: student.id },
                data: {
                    branch: 'MECH',
                    roll_no: newRollNo
                }
            });
            mechCount++;
        } else {
            console.warn(`Skipping student ${student.id} (${rollNo}): Sequence ${seq} out of expected ranges (3001-3125, 3126-3300).`);
            skippedCount++;
        }
    }

    console.log("Migration complete.");
    console.log(`Updated to CIVIL: ${civilCount}`);
    console.log(`Updated to MECH: ${mechCount}`);
    console.log(`Skipped: ${skippedCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
