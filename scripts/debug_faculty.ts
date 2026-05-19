
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- ALL FACULTY ---');
    const faculty = await prisma.facultyProfile.findMany();
    faculty.forEach(f => {
        console.log(`ID: ${f.id}, Name: "${f.name}", Email: ${f.email}`);
    });

    console.log('\n--- SCHEDULE FACULTY ---');
    const schedules = await prisma.cRTSchedule.findMany({
        include: { faculty: true }
    });

    schedules.forEach(s => {
        console.log(`Schedule: ${s.name}`);
        s.faculty.forEach(f => {
            console.log(`  - Faculty: "${f.name}"`);
        });
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
