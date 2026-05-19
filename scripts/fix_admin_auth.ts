import { PrismaClient } from '@prisma/client';
import { encrypt, hash } from '../src/utils/encryption';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Try to find by raw email first (legacy from broken seed)
  const users = await prisma.user.findMany({
    where: { email: adminEmail }
  });

  for (const user of users) {
    console.log(`Fixing legacy user ${user.id}...`);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: encrypt(adminEmail),
        email_hash: hash(adminEmail),
        password: hashedPassword, // Ensure password is correct
        mustChangePassword: false, // prevent forced change on next login
      }
    });
  }

  // Also fix any users that have null email_hash but non-null email (from seed script)
  const brokenUsers = await prisma.user.findMany({
    where: { email_hash: null, email: { not: null } }
  });

  for (const user of brokenUsers) {
    if (user.email && !user.email.includes(':')) {
      // only encrypt if it doesn't look like an encrypted string (format iv:authTag:encrypted)
      console.log(`Fixing broken user ${user.id} (${user.email})...`);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: encrypt(user.email),
          email_hash: hash(user.email),
          mustChangePassword: false
        }
      });
    }
  }

  console.log("Admin auth fix complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
