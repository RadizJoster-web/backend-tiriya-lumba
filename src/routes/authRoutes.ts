import { Router } from 'express';
const router = Router();

import { register } from '../controllers/authController/register';
import { verifyOtp } from '../controllers/authController/verifyOtp';
import { login } from '../controllers/authController/login';
import { logout } from '../controllers/authController/logout';
import { forgotPassword } from '../controllers/authController/forgotPassword';
import { resetPassword } from '../controllers/authController/resetPassword';

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
