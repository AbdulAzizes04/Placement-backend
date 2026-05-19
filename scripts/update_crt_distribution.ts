import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCrtDistribution() {
    console.log("Starting CRT Status Distribution Update (70% CRT, 30% Non-CRT)...");

    try {
        // 1. Fetch all student IDs
        const students = await prisma.studentProfile.findMany({
            select: { id: true }
        });

        const total = students.length;
        if (total === 0) {
            console.log("No students found.");
            return;
        }

        console.log(`Found ${total} students.`);

        // 2. Shuffle array (Fisher-Yates)
        for (let i = total - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [students[i], students[j]] = [students[j], students[i]];
        }

        // 3. Calculate split
        const crtCount = Math.floor(total * 0.7);
        const nonCrtCount = total - crtCount;

        const crtIds = students.slice(0, crtCount).map(s => s.id);
        const nonCrtIds = students.slice(crtCount).map(s => s.id);

        console.log(`Target: ${crtCount} CRT, ${nonCrtCount} Non-CRT`);

        // 4. Batch Updates
        console.log("Updating CRT students...");
        await prisma.studentProfile.updateMany({
            where: { id: { in: crtIds } },
            data: { is_crt: true }
        });

        console.log("Updating Non-CRT students...");
        await prisma.studentProfile.updateMany({
            where: { id: { in: nonCrtIds } },
            data: { is_crt: false }
        });

        console.log("✅ Update Complete.");

    } catch (error) {
        console.error("Update failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

updateCrtDistribution();
