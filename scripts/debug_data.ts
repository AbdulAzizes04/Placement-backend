
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Debugging Data ---');

    // 1. Check Student Batches
    const students = await prisma.studentProfile.groupBy({
        by: ['batch'],
        _count: true,
    });
    console.log('Student Batches:', students);

    // 2. Check Applications Total
    const totalApps = await prisma.application.count();
    console.log('Total Applications:', totalApps);

    // 3. Check Applications by Status
    const appsByStatus = await prisma.application.groupBy({
        by: ['status'],
        _count: true,
    });
    console.log('Applications by Status:', appsByStatus);

    // 4. Check Placed Students (Profile Status)
    const placedProfiles = await prisma.studentProfile.count({
        where: { status: 'Placed' }
    });
    console.log('Placed Student Profiles:', placedProfiles);

    // 5. Check Placement Records
    const placementRecords = await prisma.placementRecord.count();
    console.log('Placement Records:', placementRecords);

    // 6. Sample Application with Student Batch
    const sampleApp = await prisma.application.findFirst({
        include: {
            student: true,
            announcement: true
        }
    });

    if (sampleApp) {
        console.log('Sample App:', {
            id: sampleApp.id,
            status: sampleApp.status,
            studentBatch: sampleApp.student.batch,
            company: sampleApp.announcement.company_name
        });
    } else {
        console.log('No applications found to sample.');
    }

    // 7. Check if Applications differ from Announcement Companies?
    const announcementCompanies = await prisma.announcement.findMany({
        select: { company_name: true, id: true }
    });
    console.log(`Total Announcements: ${announcementCompanies.length}`);

    const connectedApps = await prisma.application.count({
        where: {
            announcement_id: { in: announcementCompanies.map(a => a.id) }
        }
    });
    console.log(`Applications linked to existing announcements: ${connectedApps}`);

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
