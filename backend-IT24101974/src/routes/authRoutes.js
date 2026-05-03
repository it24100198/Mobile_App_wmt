import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/login', authController.login);
router.get('/me', requireAuth, authController.me);
router.get('/users', requireAuth, requireRole('admin', 'manager'), authController.listUsers);
router.post('/users', requireAuth, requireRole('admin'), authController.createUser);

export default router;
