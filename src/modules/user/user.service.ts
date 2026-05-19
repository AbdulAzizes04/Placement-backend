import prisma from '../../config/prisma';

export class UserService {
  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id, is_deleted: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        created_at: true,
      },
    });
  }

  async updateUser(id: string, data: any) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async getAllUsers() {
    return await prisma.user.findMany({
      where: { is_deleted: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        created_at: true,
      },
    });
  }
}