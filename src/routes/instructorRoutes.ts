import { Router } from 'express';
const router = Router();
import { authMiddleware, authorize } from '../middlewares/authMiddleware';

import { getAvailableInstructors } from '../controllers/instructorsController/getAvailableInstructors';
import { getInstructorsForManagement } from '../controllers/instructorsController/get';
import { getInstructorByIdForManagement } from '../controllers/instructorsController/getById';
import {
  getRescheduleStatusController,
  rescheduleScheduleController,
} from '../controllers/instructorsController/rescheduleController';

router.get('/available', getAvailableInstructors);

// Endpoint Reschedule Jadwal Pelatih (Khusus Pelatih Login)
router.get(
  '/reschedule/status',
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

// Endpoint Management (Admin & Pool Manager)
router.get(
  '/management',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getInstructorsForManagement,
);

router.get(
  '/management/:id',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getInstructorByIdForManagement,
);

// Alias direct ID
router.get(
  '/:id',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getInstructorByIdForManagement,
);

export default router;
