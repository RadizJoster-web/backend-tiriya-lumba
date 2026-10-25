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
import uploadRoutes from './uploadRoutes';
import registerRoutes from './registerRoutes';
import studentRoutes from './studentRoutes';
import attendanceRoutes from './attendanceRoutes';

// Routes
rootRouter.use('/auth', authRoutes);
rootRouter.use('/areas', areaRoutes);
rootRouter.use('/locations', locationRoutes);
rootRouter.use('/packages', packageRoutes);
rootRouter.use('/sessions', sessionRoutes);
rootRouter.use('/pool-managers', poolManagerRoutes);
rootRouter.use('/instructor', instructorRoutes);
rootRouter.use('/instructors', instructorRoutes);
rootRouter.use('/upload-file', uploadRoutes);
rootRouter.use('/register', registerRoutes);
rootRouter.use('/registrations', registerRoutes);
rootRouter.use('/siswa', studentRoutes);
rootRouter.use('/students', studentRoutes);
rootRouter.use('/absensi', attendanceRoutes);
rootRouter.use('/attendances', attendanceRoutes);

export default rootRouter;
