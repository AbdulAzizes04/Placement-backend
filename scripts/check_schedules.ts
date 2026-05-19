import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
    const schedules = await prisma.cRTSchedule.findMany({
        include: { faculty: { include: { user: true } }, batches: true }
    });

    const faculty = await prisma.facultyProfile.findMany({
        include: { user: true }
    });

    const students = await prisma.studentProfile.findMany({
        take: 50,
        select: { id: true, branch: true, batch: true, is_crt: true, roll_no: true }
    });

    fs.writeFileSync('debug_schedules.json', JSON.stringify({ schedules, faculty, students }, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
