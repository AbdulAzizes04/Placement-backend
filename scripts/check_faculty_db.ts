
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking Database State...");

        const allUsers = await prisma.user.findMany({
            select: { id: true, email: true, role: true, name: true }
        });
        console.log("Total Users:", allUsers.length);

        // Check for FACULTY, STAFF, TPO
        const facultyUsers = allUsers.filter(u => ['FACULTY', 'STAFF', 'TPO'].includes(u.role));
        console.log("Users with Faculty/Staff/TPO role:", facultyUsers.length);
        facultyUsers.forEach(u => console.log(` - ${u.name} (${u.email}) [${u.role}] ID: ${u.id}`));

        const profiles = await prisma.facultyProfile.findMany();
        console.log("Total Faculty Profiles:", profiles.length);
        profiles.forEach(p => console.log(` - Profile for User ID: ${p.user_id}, Branches: ${p.assignedBranches.join(', ')}`));

        const profileUserIds = new Set(profiles.map(p => p.user_id));
        const missingProfiles = facultyUsers.filter(u => !profileUserIds.has(u.id));

        if (missingProfiles.length > 0) {
            console.log("ALERT: Users missing profiles:", missingProfiles.length);
            missingProfiles.forEach(u => console.log(`   MISSING PROFILE: ${u.name} (${u.email})`));
        } else {
            console.log("All faculty users have profiles.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
