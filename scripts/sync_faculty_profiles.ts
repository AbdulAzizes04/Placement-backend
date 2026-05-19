
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Syncing Faculty Profiles...");

        // Find all potential faculty users
        // Note: Role enum in schema: STUDENT, STAFF, TPO, ADMIN
        // We want to create profiles for STAFF and TPO. 
        // Admin might not need a "FacultyProfile" unless they act as faculty, but usually Admin manages everything.
        // The request says "Faculty role must be set correctly (FACULTY / TPO / ADMIN as applicable)".
        // Let's include ADMIN too just in case, or maybe just STAFF and TPO.
        // "Faculty module" usually implies teaching staff.
        // Re-reading user request: "TPO: Can view faculty...". "ADMIN: Can view, edit...".
        // "Display those faculty members on /admin/faculty".
        // If I am an Admin, do I show up in the list? Probably not, I am the viewer.
        // So target roles: STAFF, TPO. 

        const targetRoles: any[] = ['STAFF', 'TPO'];
        // Check if 'FACULTY' is a valid role in DB? Schema said: STUDENT, STAFF, TPO, ADMIN.
        // User request said "Faculty role must be set correctly (FACULTY / TPO / ADMIN)".
        // Implies "FACULTY" might be mapped to "STAFF" in schema.

        const users = await prisma.user.findMany({
            where: {
                role: { in: targetRoles }
            }
        });

        console.log(`Found ${users.length} users with roles: ${targetRoles.join(', ')}`);

        for (const user of users) {
            const existingProfile = await prisma.facultyProfile.findUnique({
                where: { user_id: user.id }
            });

            if (!existingProfile) {
                console.log(`Creating profile for: ${user.name} (${user.email}) - ${user.role}`);
                await prisma.facultyProfile.create({
                    data: {
                        user_id: user.id,
                        name: user.name,
                        email: user.email || "", // Email should exist
                        phone: user.phone,
                        assignedBranches: [],
                        assignedBatches: []
                    }
                });
            } else {
                console.log(`Profile already exists for: ${user.name}`);
            }
        }

        console.log("Sync Complete.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
