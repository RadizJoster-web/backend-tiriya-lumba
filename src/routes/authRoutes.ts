import { Router } from 'express';
const router = Router();

import { registerController } from '../controllers/authController/registerController';

router.post('/register', registerController);
// router.post('/verify-otp');
// router.post('/login');

export default router;
