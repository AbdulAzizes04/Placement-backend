
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFacultyProfile() {
    const email = 'dinesh@example.com';

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            faculty_profile: true // Correct relation name
        }
    });

    if (user) {
        console.log(`User found: ${user.name} (${user.id})`);
        console.log(`Role: ${user.role}`);
        if (user.faculty_profile) {
            console.log(`Faculty Profile Found: ID=${user.faculty_profile.id}`);
            // console.log(`Designation: ${user.faculty_profile.designation}`); // Removed invalid field
            // console.log(`Department: ${user.faculty_profile.department}`); // Removed invalid field
            console.log(`Assigned Branches: ${user.faculty_profile.assignedBranches}`);
        } else {
            console.log("NO Faculty Profile linked to this user!");
            // If missing, we should create one for testing
            const profile = await prisma.facultyProfile.create({
                data: {
                    user_id: user.id,
                    name: user.name,
                    email: user.email!,
                    assignedBranches: ['CSE'],
                    assignedBatches: []
                }
            });
            console.log(`Created new Faculty Profile: ID=${profile.id}`);
        }
    } else {
        console.log(`User with email ${email} not found.`);
    }
}

checkFacultyProfile()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
