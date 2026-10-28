import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { privateOperational } from '../middlewares/cacheControl';

import { registerStudentController } from '../controllers/registerController/registerStudentController';
import { registerInstructorController } from '../controllers/registerController/registerInstructorController';
import { getRegistrationsController } from '../controllers/registerController/get';
import { getRegistrationByIdController } from '../controllers/registerController/getById';
import { getMyRegistrationController } from '../controllers/registerController/getMyRegistration';
import { approveRegistrationController } from '../controllers/registerController/approveRegistration';
import { rejectRegistrationController } from '../controllers/registerController/rejectRegistration';

const router = Router();

// Tier 3: Rute status pendaftaran user sendiri (Data Operasional Realtime)
router.get('/me', privateOperational, authMiddleware, getMyRegistrationController);

// Tier 3: Rute manajemen pendaftaran (Admin & Pool Manager Scoped)
router.get(
  '/',
  privateOperational,
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getRegistrationsController,
);

router.get(
  '/:id',
  privateOperational,
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getRegistrationByIdController,
);

router.post(
  '/:id/approve',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  approveRegistrationController,
);

router.post(
  '/:id/reject',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  rejectRegistrationController,
);

// Rute submit pendaftaran
router.post('/student', authMiddleware, registerStudentController);
router.post('/instructor', authMiddleware, registerInstructorController);

export default router;
