
import prisma from '../src/config/prisma';

async function main() {
    console.log("Starting debug script...");
    try {
        // Find or Create a student to test with
        let student = await prisma.studentProfile.findFirst();
        if (!student) {
            console.log("No student found. Creating dummy student...");
            const crypto = require('crypto');
            const rollNo = `TEST-${crypto.randomBytes(4).toString('hex')}`;

            // Need a user first
            const user = await prisma.user.create({
                data: {
                    name: "Test User",
                    email: `test-${rollNo}@example.com`, // Encrypt in real app, simplistic for debug
                    password: "password",
                    role: "STUDENT",
                    college: {
                        create: {
                            name: "Test College",
                            code: `TC-${rollNo}`
                        }
                    },
                    mustChangePassword: false
                }
            });

            student = await prisma.studentProfile.create({
                data: {
                    user_id: user.id,
                    college_id: user.college_id,
                    roll_no: rollNo,
                    roll_no_hash: crypto.createHash('sha256').update(rollNo).digest('hex'),
                    branch: "CSE",
                    year: 4,
                    cgpa: 8.5
                }
            });
        }
        console.log(`Testing with student ID: ${student.id}`);

        const result = await prisma.attendance.findMany({
            where: {
                student_id: student.id,
                is_deleted: false
            },
            include: {
                schedule: {
                    select: {
                        name: true,
                        type: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        console.log("Query success!");
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error("Error occurred:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
