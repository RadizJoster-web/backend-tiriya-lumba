import { Router } from 'express';
const router = Router();

import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { registerStudentController } from '../controllers/registerController/registerStudentController';
import { registerInstructorController } from '../controllers/registerController/registerInstructorController';
import { getRegistrationsController } from '../controllers/registerController/get';
import { getRegistrationByIdController } from '../controllers/registerController/getById';

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
router.post('/student', authMiddleware, registerStudentController);
router.post('/instructor', authMiddleware, registerInstructorController);

export default router;
