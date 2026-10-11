import { Router } from 'express';
const rootRouter = Router();

// Routes import
import authRoutes from './authRoutes';
import locationRoutes from './locationRoutes';

// Routes
rootRouter.use('/auth', authRoutes);
rootRouter.use('/locations', locationRoutes);

export default rootRouter;
