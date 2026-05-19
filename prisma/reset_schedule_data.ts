
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Schedule & Attendance Data Reset...');

    // 1. Delete all Attendance records
    const deletedAttendance = await prisma.attendance.deleteMany({});
    console.log(`Deleted ${deletedAttendance.count} attendance records.`);

    // 2. Delete all CRT Schedules
    // Note: This cascading delete might handle attendance if configured, 
    // but explicit delete is safer for logging.
    const deletedSchedules = await prisma.cRTSchedule.deleteMany({});
    console.log(`Deleted ${deletedSchedules.count} CRT schedules.`);

    console.log('Reset Complete. Clean slate for Phase 2.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
