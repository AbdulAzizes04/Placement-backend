import { Router } from 'express';
import { AnnouncementController } from './announcement.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { ROLES } from '../../config/constants';

const router = Router();
const announcementController = new AnnouncementController();

const isTPOOrAdmin = authorize(ROLES.ADMIN, ROLES.TPO);

// Public/Authenticated Reads
router.get('/', announcementController.getAll);
router.get('/:id', announcementController.getById);

// Protected Writes
router.post('/', authenticate, isTPOOrAdmin, announcementController.create);
router.put('/:id', authenticate, isTPOOrAdmin, announcementController.update);
router.post('/bulk-delete', authenticate, isTPOOrAdmin, announcementController.bulkDelete);
router.delete('/:id', authenticate, isTPOOrAdmin, announcementController.delete);

export default router;