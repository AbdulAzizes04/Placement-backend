import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'password123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: '39fef15b-16b7-4ff6-8fec-c692d44a4beb' },
    data: { password: hashedPassword }
  });
  
  console.log("Password reset successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
