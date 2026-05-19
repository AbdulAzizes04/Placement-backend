
import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// --- Types ---
interface CreateScheduleRequest {
    name: string;
    academic_year: string;
    type: 'BATCH' | 'BRANCH';

    // If BATCH
    batchIds?: string[];

    // If BRANCH
    branch?: string;

    start_date: string;
    end_date: string;
    room_no: string;

    facultyIds: string[];
}

export const createSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateScheduleRequest;

        // Validation
        if (!data.name || !data.academic_year || !data.type || !data.start_date || !data.end_date || !data.room_no) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        if (data.type === 'BATCH' && (!data.batchIds || data.batchIds.length === 0)) {
            res.status(400).json({ error: "Batch IDs required for Batch-type schedule" });
            return;
        }

        if (data.type === 'BRANCH' && !data.branch) {
            res.status(400).json({ error: "Branch required for Branch-type schedule" });
            return;
        }

        // Prepare Relations
        const batchConnect = data.type === 'BATCH' && data.batchIds
            ? { connect: data.batchIds.map(id => ({ id })) }
            : undefined;

        const facultyConnect = data.facultyIds && data.facultyIds.length > 0
            ? { connect: data.facultyIds.map(id => ({ id })) }
            : undefined;

        const newSchedule = await prisma.cRTSchedule.create({
            data: {
                name: data.name,
                academic_year: data.academic_year,
                type: data.type,
                branch: data.type === 'BRANCH' ? data.branch : null,
                start_date: new Date(data.start_date),
                end_date: new Date(data.end_date),
                room_no: data.room_no,
                // Relations
                batches: batchConnect,
                faculty: facultyConnect
            }
        });

        res.status(201).json(newSchedule);

    } catch (error: any) {
        console.error("Create schedule error:", error);
        res.status(500).json({ error: "Failed to create schedule" });
    }
};

export const getSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
        const { year, type, status, facultyId } = req.query;

        const where: Prisma.CRTScheduleWhereInput = {
            is_deleted: false
        };

        if (year) where.academic_year = String(year);
        if (type) where.type = String(type) as 'BATCH' | 'BRANCH';
        if (status) where.status = String(status);

        if (facultyId) {
            where.faculty = {
                some: { id: String(facultyId) }
            };
        }

        const schedules = await prisma.cRTSchedule.findMany({
            where,
            include: {
                batches: { select: { batch_name: true } },
                faculty: { select: { name: true, id: true } },
                _count: { select: { attendances: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(schedules);
    } catch (error) {
        console.error("Get schedules error:", error);
        res.status(500).json({ error: "Failed to fetch schedules" });
    }
};

export const getScheduleById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const schedule = await prisma.cRTSchedule.findUnique({
            where: { id },
            include: {
                batches: true,
                faculty: {
                    select: { id: true, name: true, email: true, assignedBranches: true }
                }
            }
        });

        if (!schedule) {
            res.status(404).json({ error: "Schedule not found" });
            return;
        }

        res.json(schedule);
    } catch (error) {
        console.error("Get schedule error:", error);
        res.status(500).json({ error: "Failed to fetch schedule" });
    }
};

export const deleteSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Soft delete
        await prisma.cRTSchedule.update({
            where: { id },
            data: { is_deleted: true }
        });

        res.json({ message: "Schedule deleted" });

    } catch (error) {
        console.error("Delete schedule error:", error);
        res.status(500).json({ error: "Failed to delete schedule" });
    }
};
