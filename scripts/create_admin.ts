import { PrismaClient } from '@prisma/client';
import { encrypt, hash } from '../src/utils/encryption';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const hashedPassword = await bcrypt.hash('password123', 10);
  const emailHash = hash(adminEmail);
  
  let college = await prisma.college.findFirst({ where: { code: 'EXU' } });
  if (!college) {
      college = await prisma.college.create({
          data: { name: 'Example University', code: 'EXU' }
      });
  }

  const user = await prisma.user.upsert({
    where: { email_hash: emailHash },
    update: {
      password: hashedPassword,
      mustChangePassword: false,
    },
    create: {
      name: 'Admin User',
      email: encrypt(adminEmail),
      email_hash: emailHash,
      password: hashedPassword,
      role: 'ADMIN',
      college_id: college.id,
      mustChangePassword: false,
    }
  });

  console.log('Admin user ensured:', user.id, adminEmail);
}

main().catch(console.error).finally(() => prisma.$disconnect());
