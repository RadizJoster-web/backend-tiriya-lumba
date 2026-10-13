// src/routes/sessionRoutes.ts
import { Router } from 'express';
const router = Router();
import { authMiddleware, authorize } from '../middlewares/authMiddleware';

import { getSessions } from '../controllers/sessionController/get';
import { getSessionById } from '../controllers/sessionController/getById';
import { createSession } from '../controllers/sessionController/create';
import { updateSession } from '../controllers/sessionController/update';
import { deleteSession } from '../controllers/sessionController/delete';

// Rute Publik / All Authenticated Users (Untuk melihat pilihan sesi)
router.get('/', getSessions);
router.get('/:id', getSessionById);

// Rute Terproteksi (Hanya Admin & Pool Manager yang dapat mengelola jam sesi)
router.post(
  '/',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  createSession,
);
router.put(
  '/:id',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  updateSession,
);
router.delete(
  '/:id',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  deleteSession,
);

export default router;
