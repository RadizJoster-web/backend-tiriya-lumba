import { Router } from 'express';
const rootRouter = Router();

// Routes import
import authRoutes from './authRoutes';
import locationRoutes from './locationRoutes';
import packageRoutes from './packageRoutes';

// Routes
rootRouter.use('/auth', authRoutes);
rootRouter.use('/locations', locationRoutes);
rootRouter.use('/packages', packageRoutes);

export default rootRouter;
