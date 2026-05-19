import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyPlacements() {
    console.log("Starting Placement Data Integrity Audit...");

    try {
        const placements = await prisma.placementRecord.findMany({
            include: {
                student: true
            }
        });

        console.log(`Total Placement Records: ${placements.length}`);

        const orphans = placements.filter(p => !p.student);

        if (orphans.length === 0) {
            console.log("✅ Integrity Logic Pass: All placements have valid linked students.");
        } else {
            console.error(`❌ Found ${orphans.length} ORPHAN placements (missing student relation).`);
            console.log("Orphan IDs:", orphans.map(p => p.id));

            // Cleanup Logic (as requested)
            console.log("Cleaning up orphans...");
            const deleted = await prisma.placementRecord.deleteMany({
                where: {
                    id: { in: orphans.map(p => p.id) }
                }
            });
            console.log(`✅ Deleted ${deleted.count} orphan records.`);
        }

    } catch (error) {
        console.error("Audit failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyPlacements();
