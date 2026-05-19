import { Router } from 'express';
import { ApplicationController } from './application.controller';

const router = Router();
const applicationController = new ApplicationController();

router.post('/apply', applicationController.apply);
router.post('/bulk-update', applicationController.bulkUpdate);
router.get('/my', applicationController.getMyApplications);
router.put('/:id/status', applicationController.updateStatus);
router.get('/', applicationController.getAll);

export default router;