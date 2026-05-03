import { Router } from 'express';
import authRoutes from './authRoutes.js';
import manufacturingRoutes from './manufacturingRoutes.js';
import * as authService from '../services/authService.js';

const router = Router();

// Seed admin on first request (dev convenience)
let seeded = false;
router.use(async (req, res, next) => {
  if (!seeded) {
    await authService.seedAdminUser().catch((err) => {
      console.error('❌ Admin seed failed:', err.message);
    });
    seeded = true;
  }
  next();
});

router.use('/auth', authRoutes);
router.use('/manufacturing', manufacturingRoutes);

export default router;
