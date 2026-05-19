import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { id: '39fef15b-16b7-4ff6-8fec-c692d44a4beb' },
    data: { mustChangePassword: false }
  });
  console.log("Updated mustChangePassword to false");
}

main().catch(console.error).finally(() => prisma.$disconnect());
