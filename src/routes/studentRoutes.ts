import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import {
  getStudentsController,
  getStudentByIdController,
} from '../controllers/studentsController';

const router = Router();

// Endpoint untuk mengambil daftar siswa terdaftar / murid aktif (khusus Admin & Pool Manager)
router.get(
  '/',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getStudentsController,
);

// Endpoint untuk melihat detail lengkap seorang siswa
router.get(
  '/:id',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getStudentByIdController,
);

export default router;
