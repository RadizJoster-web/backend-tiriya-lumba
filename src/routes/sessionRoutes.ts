// src/routes/sessionRoutes.ts
import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { cachePublicCdn } from '../middlewares/cacheControl';

import { getSessions } from '../controllers/sessionController/get';
import { getSessionById } from '../controllers/sessionController/getById';
import { createSession } from '../controllers/sessionController/create';
import { updateSession } from '../controllers/sessionController/update';
import { deleteSession } from '../controllers/sessionController/delete';

const router = Router();

// Rute Publik (Tier 1: Vercel CDN Cache untuk melihat pilihan sesi)
router.get('/', cachePublicCdn, getSessions);
router.get('/:id', cachePublicCdn, getSessionById);

// Rute Terproteksi (Hanya Admin & Pool Manager yang dapat mengelola jam sesi)
router.post(
  '/',
  authMiddleware,
  authorize('ADMIN'),
  createSession,
);
router.put(
  '/:id',
  authMiddleware,
  authorize('ADMIN'),
  updateSession,
);
router.delete(
  '/:id',
  authMiddleware,
  authorize('ADMIN'),
  deleteSession,
);

export default router;
