import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import {
  getAttendanceTodayController,
  submitAttendanceController,
  getAttendanceHistoryController,
} from '../controllers/attendanceController';

const router = Router();

// Endpoint untuk mengambil orang yang jadwalnya hari ini
router.get(
  '/today',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getAttendanceTodayController,
);

// Endpoint untuk mengambil riwayat absensi
router.get(
  '/',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getAttendanceHistoryController,
);

// Endpoint untuk submit pencatatan absensi
router.post(
  '/',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  submitAttendanceController,
);

export default router;
