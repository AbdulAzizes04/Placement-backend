import { Router } from 'express';
import { PlacementController } from './placement.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { ROLES } from '../../config/constants';

const router = Router();
const placementController = new PlacementController();

// Apply authentication to all routes
router.use(authenticate);

const isTPOOrAdmin = authorize(ROLES.ADMIN, ROLES.TPO);

// Protect Write Operations
router.post('/', isTPOOrAdmin, placementController.create);

// Read Operations
router.get('/', isTPOOrAdmin, placementController.getAll);
router.get('/student/:studentId', placementController.getByStudent);

export default router;