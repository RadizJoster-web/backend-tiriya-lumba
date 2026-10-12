// src/routes/sessionRoutes.ts
import { Router } from 'express';
import { sessionController } from '../controllers/sessionController';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Rute Publik / All Authenticated Users (Untuk melihat pilihan sesi)
router.get('/', sessionController.getSessions);
router.get('/:id', sessionController.getSessionById);

// Rute Terproteksi (Hanya Admin & Pool Manager yang dapat mengelola jam sesi)
router.post(
  '/',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  sessionController.createSession,
);

router.put(
  '/:id',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  sessionController.updateSession,
);

router.delete(
  '/:id',
  authMiddleware,
  authorize('ADMIN', 'POOL_MANAGER'),
  sessionController.deleteSession,
);

export default router;
