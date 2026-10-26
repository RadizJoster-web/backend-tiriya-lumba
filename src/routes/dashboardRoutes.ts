import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { getDashboardSummaryController } from '../controllers/dashboardController';

const router = Router();

// Endpoint agregasi ringkasan statistik dasbor (khusus ADMIN & POOL_MANAGER)
router.get(
  '/summary',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getDashboardSummaryController,
);

export default router;
