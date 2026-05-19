import prisma from '../../config/prisma';

export class AnnouncementService {
  async create(data: any, userId: string, collegeId: string) {
    return await prisma.announcement.create({
      data: {
        ...data,
        created_by: userId,
        college_id: collegeId,
      },
    });
  }

  async getAll(filters: any, page: number = 1, limit: number = 20) {
    const { search, ...otherFilters } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      is_deleted: false,
    };

    if (search) {
      whereClause.OR = [
        { company_name: { contains: search, mode: 'insensitive' } },
        { job_role: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (otherFilters.college_id) {
      whereClause.college_id = otherFilters.college_id;
    }

    if (otherFilters.student_branch) {
      whereClause.AND = [
        {
          OR: [
            { allowed_branches: { has: otherFilters.student_branch } },
            { allowed_branches: { equals: [] } }
          ]
        }
      ];

      if (otherFilters.is_crt !== undefined) {
        if (!otherFilters.is_crt) {
          whereClause.is_crt_only = false;
        }
      }
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          creator: {
            select: { name: true }
          }
        }
      }),
      prisma.announcement.count({ where: whereClause })
    ]);

    return {
      announcements,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getById(id: string) {
    // use findFirst so we can apply non-unique filters (like is_deleted)
    return await prisma.announcement.findFirst({
      where: { id, is_deleted: false },
    });
  }

  async update(id: string, data: any) {
    return await prisma.announcement.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Soft delete all applications related to this announcement
      await tx.application.updateMany({
        where: { announcement_id: id },
        data: { is_deleted: true },
      });

      // 2. Soft delete the announcement itself
      return await tx.announcement.update({
        where: { id },
        data: { is_deleted: true },
      });
    });
  }

  async bulkDelete(ids: string[]) {
    return await prisma.$transaction(async (tx) => {
      // 1. Soft delete all applications related to these announcements
      await tx.application.updateMany({
        where: { announcement_id: { in: ids } },
        data: { is_deleted: true },
      });

      // 2. Soft delete the announcements
      return await tx.announcement.updateMany({
        where: { id: { in: ids } },
        data: { is_deleted: true },
      });
    });
  }
}