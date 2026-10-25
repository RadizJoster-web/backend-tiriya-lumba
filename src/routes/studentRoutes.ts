import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { getStudentsController } from '../controllers/studentsController';

const router = Router();

// Endpoint untuk mengambil daftar siswa terdaftar / murid aktif (khusus Admin & Pool Manager)
router.get(
  '/',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getStudentsController,
);

export default router;
