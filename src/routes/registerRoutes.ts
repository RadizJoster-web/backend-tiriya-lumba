import { Router } from 'express';
const router = Router();

import { authMiddleware } from '../middlewares/authMiddleware';
import { registerStudentController } from '../controllers/registerController/registerStudentController';

router.post('/student', authMiddleware, registerStudentController);

export default router;
