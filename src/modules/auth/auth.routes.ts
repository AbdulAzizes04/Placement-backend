import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();
const authController = new AuthController();


import { loginLimiter } from '../../middlewares/rateLimit.middleware';

import { authenticate } from '../../middlewares/auth.middleware';

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/reset-password', authController.resetPassword);

export default router;