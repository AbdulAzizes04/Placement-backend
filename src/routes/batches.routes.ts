
import { Router } from 'express';
import {
    importBatches,
    allocateBatches,
    getBatches,
    getBranchStats,
    exportBatch,
    checkAvailability,
    getBatchById,
    deleteBatch,
    deleteAllBatches,
    unassignStudent,
    createBatchFromCSV
} from '../controllers/batches.controller';

import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { ROLES } from '../config/constants';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Restricted Routes (Admin & TPO)
const isTPOOrAdmin = authorize(ROLES.ADMIN, ROLES.TPO);

router.post('/import', isTPOOrAdmin, importBatches);
router.post('/create-from-csv', isTPOOrAdmin, createBatchFromCSV);
router.post('/allocate', isTPOOrAdmin, allocateBatches);
router.post('/availability', isTPOOrAdmin, checkAvailability);
router.post('/delete-all', isTPOOrAdmin, deleteAllBatches);
router.get('/', isTPOOrAdmin, getBatches);
router.get('/branch-stats', isTPOOrAdmin, getBranchStats);
router.post('/unassign', isTPOOrAdmin, unassignStudent);
router.get('/:id', isTPOOrAdmin, getBatchById);
router.delete('/:id', isTPOOrAdmin, deleteBatch);
router.get('/:id/export', isTPOOrAdmin, exportBatch);

export default router;
