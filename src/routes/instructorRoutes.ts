import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { noCacheRealtime, privateOperational } from '../middlewares/cacheControl';

import { getAvailableInstructors } from '../controllers/instructorsController/getAvailableInstructors';
import { getInstructorsForManagement } from '../controllers/instructorsController/get';
import { getInstructorByIdForManagement } from '../controllers/instructorsController/getById';
import {
  getRescheduleStatusController,
  rescheduleScheduleController,
} from '../controllers/instructorsController/rescheduleController';

const router = Router();

// Tier 2: Real-Time High-Contention Data (Mutual Exclusion Clash Guard)
router.get('/available', noCacheRealtime, getAvailableInstructors);

// Tier 2: Endpoint Reschedule Jadwal Pelatih (Khusus Pelatih Login, Token Dinamis)
router.get(
  '/reschedule/status',
  noCacheRealtime,
  authMiddleware,
  authorize('INSTRUCTOR'),
  getRescheduleStatusController,
);

router.put(
  '/reschedule',
  authMiddleware,
  authorize('INSTRUCTOR'),
  rescheduleScheduleController,
);

// Tier 3: Endpoint Management (Admin & Pool Manager Scoped)
router.get(
  '/management',
  privateOperational,
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getInstructorsForManagement,
);

router.get(
  '/management/:id',
  privateOperational,
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getInstructorByIdForManagement,
);

// Alias direct ID
router.get(
  '/:id',
  privateOperational,
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getInstructorByIdForManagement,
);

export default router;
