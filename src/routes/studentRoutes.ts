import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { privateOperational } from '../middlewares/cacheControl';
import {
  getStudentsController,
  getStudentByIdController,
} from '../controllers/studentsController';

const router = Router();

// Tier 3: Endpoint daftar siswa terdaftar / murid aktif (khusus Admin & Pool Manager Scoped)
router.get(
  '/',
  privateOperational,
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getStudentsController,
);

// Tier 3: Endpoint detail lengkap seorang siswa
router.get(
  '/:id',
  privateOperational,
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getStudentByIdController,
);

export default router;
