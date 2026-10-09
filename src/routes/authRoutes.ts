import { Router } from 'express';
const router = Router();

import { registerController } from '../controllers/authController/registerController';
import { verifyOtpController } from '../controllers/authController/verifyOtpController';

router.post('/register', registerController);
router.post('/verify-otp', verifyOtpController);
// router.post('/login');

export default router;
