import { Router } from 'express';
const rootRouter = Router();

// Routes import
import authRoutes from './authRoutes';
import areaRoutes from './areaRoutes';
import locationRoutes from './locationRoutes';
import packageRoutes from './packageRoutes';
import sessionRoutes from './sessionRoutes';
import poolManagerRoutes from './poolManagerRoutes';
import instructorRoutes from './instructorRoutes';

// Routes
rootRouter.use('/auth', authRoutes);
rootRouter.use('/areas', areaRoutes);
rootRouter.use('/locations', locationRoutes);
rootRouter.use('/packages', packageRoutes);
rootRouter.use('/sessions', sessionRoutes);
rootRouter.use('/pool-managers', poolManagerRoutes);
rootRouter.use('/instructor', instructorRoutes);

export default rootRouter;
