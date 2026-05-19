import { PrismaClient } from '@prisma/client';
import { decrypt } from '../src/utils/encryption';
import * as fs from 'fs';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'STAFF' }
  });
  
  const staff = [];
  for (const u of users) {
    const email = u.email ? decrypt(u.email) : 'N/A';
    staff.push({
      name: u.name,
      email: email,
      id: u.id
    });
  }
  fs.writeFileSync('staff_output.json', JSON.stringify(staff, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
