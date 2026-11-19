import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { getPoolCapacity } from '../controllers/monitoringController/getPoolCapacity';
import { toggleCoachRegistration } from '../controllers/monitoringController/toggleCoachRegistration';

const router = Router();

// Endpoint Monitoring Kapasitas Kolam & Alokasi Pelatih
router.get(
  '/pool-capacity',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getPoolCapacity,
);

// Toggle BUKA / TUTUP Pendaftaran Pelatih untuk Kolam Tertentu (Khusus ADMIN)
router.patch(
  '/locations/:id/toggle-coach-registration',
  authMiddleware,
  authorize('ADMIN'),
  toggleCoachRegistration,
);

export default router;
