import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { privateDashboardSummary } from '../middlewares/cacheControl';
import { getDashboardSummaryController } from '../controllers/dashboardController';

const router = Router();

// Tier 4: Agregasi ringkasan statistik dasbor (khusus ADMIN & POOL_MANAGER)
router.get(
  '/summary',
  privateDashboardSummary,
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getDashboardSummaryController,
);

export default router;
