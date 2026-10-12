import { Router } from 'express';
const rootRouter = Router();

// Routes import
import authRoutes from './authRoutes';
import areaRoutes from './areaRoutes';
import locationRoutes from './locationRoutes';
import packageRoutes from './packageRoutes';
import sessionRoutes from './sessionRoutes';

// Routes
rootRouter.use('/auth', authRoutes);
rootRouter.use('/areas', areaRoutes);
rootRouter.use('/locations', locationRoutes);
rootRouter.use('/packages', packageRoutes);
rootRouter.use('/sessions', sessionRoutes);

export default rootRouter;
