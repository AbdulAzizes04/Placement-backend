import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { encrypt, hash } from '../src/utils/encryption';

const prisma = new PrismaClient();

const branches = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'AI&DS', 'IOT', 'CS-DS', 'CS-AI', 'AIML'];
const skills = ['Java', 'Python', 'React', 'Node', 'SQL', 'AWS'];

async function main() {
  console.log('Starting seed...');

  // 1. Get or Create College
  let college = await prisma.college.findUnique({
    where: { code: 'EXU' },
  });

  if (!college) {
    college = await prisma.college.create({
      data: {
        name: 'Example University',
        code: 'EXU',
      },
    });
    console.log('College created');
  } else {
    console.log('College already exists');
  }

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 2. Get or Create Admin
  const adminEmail = 'admin@example.com';
  let admin = await prisma.user.findFirst({ where: { email_hash: hash(adminEmail) } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: encrypt(adminEmail),
        email_hash: hash(adminEmail),
        password: hashedPassword,
        role: 'ADMIN',
        college_id: college.id,
      },
    });
    console.log('Admin created');
  }

  // 3. Ensure TPOs exist (Upsert-ish logic)
  const tpos = [];
  for (let i = 0; i < 3; i++) {
    const email = `tpo${i + 1}@example.com`;
    let tpo = await prisma.user.findFirst({ where: { email_hash: hash(email) } });
    if (!tpo) {
      tpo = await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: encrypt(email),
          email_hash: hash(email),
          password: hashedPassword,
          role: 'TPO',
          college_id: college.id,
        },
      });
    }
    tpos.push(tpo);
  }
  console.log('TPOs checked/created');

  // 4. Ensure Students exist
  console.log('Checking/Creating Students...');
  let students = await prisma.studentProfile.findMany({
    take: 100, // Just grab some existing ones
    include: { user: true }
  });

  if (students.length < 50) {
    const rollNumbers = new Set<string>();
    const newStudents = [];
    for (let i = 0; i < 50; i++) {
      let rollNo: string;
      do {
        rollNo = `202${Math.floor(Math.random() * 10)}${branches[Math.floor(Math.random() * branches.length)]}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      } while (rollNumbers.has(rollNo));
      rollNumbers.add(rollNo);

      const email = `student_new${i + Date.now()}@example.com`;

      const user = await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: encrypt(email),
          email_hash: hash(email),
          password: hashedPassword,
          role: 'STUDENT',
          college_id: college.id,
          username: encrypt(rollNo),
          username_hash: hash(rollNo),
        }
      });

      const profile = await prisma.studentProfile.create({
        data: {
          user_id: user.id,
          college_id: college.id,
          roll_no: encrypt(rollNo),
          roll_no_hash: hash(rollNo),
          branch: branches[Math.floor(Math.random() * branches.length)],
          year: Math.floor(Math.random() * 4) + 1,
          cgpa: Math.round((5 + Math.random() * 4.5) * 10) / 10,
          skills: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => skills[Math.floor(Math.random() * skills.length)]),
        },
      });
      newStudents.push({ ...profile, user });
    }
    students = [...students, ...newStudents] as any;
    console.log('Added 50 new students');
  }

  // 5. Ensure Announcements exist
  console.log('Checking/Creating Announcements...');
  let announcements = await prisma.announcement.findMany({ take: 50 });
  if (announcements.length < 10) {
    for (let i = 0; i < 20; i++) {
      const announcement = await prisma.announcement.create({
        data: {
          company_name: faker.company.name(),
          job_role: faker.person.jobTitle(),
          description: faker.lorem.paragraph(),
          application_link: faker.internet.url(),
          required_cgpa: Math.round((6 + Math.random() * 3) * 10) / 10, // 6.0 to 9.0
          required_skills: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => skills[Math.floor(Math.random() * skills.length)]),
          allowed_branches: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => branches[Math.floor(Math.random() * branches.length)]),
          deadline: faker.date.future(),
          created_by: tpos[0].id, // Assign to first TPO
          college_id: college.id,
        },
      });
      announcements.push(announcement);
    }
    console.log('Added 20 new announcements');
  }

  // 6. Seed Applications (The Main Goal)
  console.log('Seeding Applications...');
  const applicationSet = new Set<string>();

  // Fetch existing apps to avoid duplicates
  const existingApps = await prisma.application.findMany({
    select: { student_id: true, announcement_id: true }
  });
  existingApps.forEach(app => applicationSet.add(`${app.student_id}-${app.announcement_id}`));

  let createdCount = 0;
  // Create 100 random applications with updated logic
  for (let i = 0; i < 100; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const announcement = announcements[Math.floor(Math.random() * announcements.length)];

    if (!student || !announcement) continue;

    const studentId = student.id;
    const uniqueKey = `${studentId}-${announcement.id}`;

    if (!applicationSet.has(uniqueKey)) {
      applicationSet.add(uniqueKey);

      const status = ['APPLIED', 'SHORTLISTED', 'REJECTED', 'PLACED'][Math.floor(Math.random() * 4)];

      await prisma.application.create({
        data: {
          student_id: studentId,
          announcement_id: announcement.id,
          status: status as any,
        },
      });
      createdCount++;

      // [FIX] If status is PLACED, verify/create PlacementRecord and update Profile Status
      if (status === 'PLACED') {
        // Update Student Profile Logic
        // 1. Update DB Status (so dashboard filter works)
        // 2. Ensure batch is '2022-2026' for visibility on default dashboard view (optional but good for visibility)
        await prisma.studentProfile.update({
          where: { id: studentId },
          data: {
            status: 'Placed',
            batch: '2022-2026' // Force batch for visibility in dashboard
          }
        });

        // Create Placement Record
        // Extract package
        let packageValue = 0;
        const pkgStr = (announcement as any).package; // announcement object might allow package (string)
        // Note: create announcement in loop above uses "package": string.
        if (pkgStr) {
          const match = String(pkgStr).match(/(\d+(\.\d+)?)/);
          if (match) packageValue = parseFloat(match[0]);
        }

        const existingPlacement = await prisma.placementRecord.findFirst({
          where: { student_id: studentId, company_name: announcement.company_name }
        });

        if (!existingPlacement) {
          await prisma.placementRecord.create({
            data: {
              student_id: studentId,
              company_name: announcement.company_name,
              package: packageValue || 5.5, // Default if parsing fails
              placed_at: new Date(),
            }
          });
        }
      } else {
        // If not placed, ensure batch is set so they appear in 'Total Students'
        await prisma.studentProfile.update({
          where: { id: studentId },
          data: {
            batch: '2022-2026'
          }
        });
      }
    }
  }

  console.log(`Seeding completed. Created ${createdCount} new applications (and related placement records).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });