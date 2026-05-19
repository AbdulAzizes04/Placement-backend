import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCrtCounts() {
    console.log("Check CRT Counts...");
    const crt = await prisma.studentProfile.count({ where: { is_crt: true } });
    const nonCrt = await prisma.studentProfile.count({ where: { is_crt: false } });

    console.log(`CRT: ${crt}`);
    console.log(`Non-CRT: ${nonCrt}`);
    console.log(`Total: ${crt + nonCrt}`);
}

checkCrtCounts()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
