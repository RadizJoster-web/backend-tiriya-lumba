import { Router } from 'express';
const router = Router();

import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { registerStudentController } from '../controllers/registerController/registerStudentController';
import { registerInstructorController } from '../controllers/registerController/registerInstructorController';
import { getRegistrationsController } from '../controllers/registerController/get';
import { getRegistrationByIdController } from '../controllers/registerController/getById';
import { getMyRegistrationController } from '../controllers/registerController/getMyRegistration';
import { approveRegistrationController } from '../controllers/registerController/approveRegistration';
import { rejectRegistrationController } from '../controllers/registerController/rejectRegistration';

// Rute untuk user yang sedang login membaca status pendaftarannya sendiri
router.get('/me', authMiddleware, getMyRegistrationController);

// Rute manajemen pendaftaran (Admin & Pool Manager)
router.get(
  '/',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  getRegistrationsController,
);

router.get(
  '/:id',
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
