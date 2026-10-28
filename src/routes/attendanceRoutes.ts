import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { privateOperational } from '../middlewares/cacheControl';
import {
  getAttendanceTodayController,
  submitAttendanceController,
  getAttendanceHistoryController,
  getMyAttendanceHistoryController,
} from '../controllers/attendanceController';

const router = Router();

// Tier 3: Riwayat absensi murid login
router.get('/my-history', privateOperational, authMiddleware, getMyAttendanceHistoryController);

// Tier 3: Daftar murid dengan jadwal hari ini (Admin & Pool Manager Scoped)
router.get(
  '/today',
  privateOperational,
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getAttendanceTodayController,
);

// Tier 3: Riwayat absensi (Admin & Pool Manager Scoped)
router.get(
  '/',
  privateOperational,
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getAttendanceHistoryController,
);

// Endpoint submit pencatatan absensi
router.post(
  '/',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  submitAttendanceController,
);

export default router;
