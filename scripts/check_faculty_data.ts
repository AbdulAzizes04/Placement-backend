
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const faculty = await prisma.facultyProfile.findMany({
            take: 5,
            include: { user: true }
        });
        console.log("Faculty Count:", faculty.length);
        if (faculty.length > 0) {
            console.log("Faculty Name (Profile):", faculty[0].name);
            console.log("Faculty Name (User):", faculty[0].user?.name);
            console.log("Structure:", JSON.stringify(faculty[0], null, 2));
        } else {
            console.log("No faculty found.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
