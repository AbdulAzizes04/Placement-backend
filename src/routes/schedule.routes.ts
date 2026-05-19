
import { Router } from 'express';
import { createSchedule, getSchedules, getScheduleById, deleteSchedule } from '../controllers/schedule.controller';

const router = Router();

router.post('/', createSchedule);
router.get('/', getSchedules);
router.get('/:id', getScheduleById);
router.delete('/:id', deleteSchedule);

export default router;
