// src/routes/areaRoutes.ts
import { Router } from 'express';
import { areaController } from '../controllers/areaController';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Rute Publik (Digunakan frontend untuk dropdown filter daerah)
router.get('/', areaController.getAreas);
router.get('/:id', areaController.getAreaById);

// Rute Terproteksi (Hanya ADMIN yang dapat mengelola master data area)
router.post('/', authMiddleware, authorize('ADMIN'), areaController.createArea);

router.put(
  '/:id',
  authMiddleware,
  authorize('ADMIN'),
  areaController.updateArea,
);

router.delete(
  '/:id',
  authMiddleware,
  authorize('ADMIN'),
  areaController.deleteArea,
);

export default router;
