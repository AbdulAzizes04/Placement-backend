import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.studentProfile.updateMany({
        where: { roll_no: 'TEST-bd09f90b' },
        data: { batch: '2022-2026', is_crt: true }
    });
    console.log(`Updated ${result.count} test students!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
