import prisma from '../src/config/prisma';

(async () => {
  try {
    const count = await prisma.announcement.count();
    console.log('announcements:', count);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();