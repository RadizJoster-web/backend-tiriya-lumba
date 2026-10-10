import { Router } from 'express';
const router = Router();

import { registerController } from '../controllers/authController/registerController';
import { verifyOtpController } from '../controllers/authController/verifyOtpController';
import { loginController } from '../controllers/authController/loginController';

router.post('/register', registerController);
router.post('/verify-otp', verifyOtpController);
router.post('/login', loginController);

export default router;
