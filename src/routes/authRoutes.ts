import { Router } from 'express';
import { authRateLimit } from '../middlewares/rateLimiter';

import { register } from '../controllers/authController/register';
import { verifyOtp } from '../controllers/authController/verifyOtp';
import { login } from '../controllers/authController/login';
import { logout } from '../controllers/authController/logout';
import { forgotPassword } from '../controllers/authController/forgotPassword';
import { resetPassword } from '../controllers/authController/resetPassword';

const router = Router();

router.post('/register', authRateLimit, register);
router.post('/verify-otp', authRateLimit, verifyOtp);
router.post('/login', authRateLimit, login);
router.post('/logout', logout);
router.post('/forgot-password', authRateLimit, forgotPassword);
router.post('/reset-password', authRateLimit, resetPassword);

export default router;
