import { Router } from 'express';
const router = Router();

import { authMiddleware } from '../middlewares/authMiddleware';
import { registerStudentController } from '../controllers/registerController/registerStudentController';
import { registerInstructorController } from '../controllers/registerController/registerInstructorController';


router.post('/student', authMiddleware, registerStudentController);
router.post('/instructor', authMiddleware, registerInstructorController);

export default router;
