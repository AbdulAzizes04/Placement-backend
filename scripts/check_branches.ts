
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const grouped = await prisma.studentProfile.groupBy({
        by: ['branch'],
        _count: {
            branch: true
        }
    });

    console.log("Branch Counts:", grouped);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
