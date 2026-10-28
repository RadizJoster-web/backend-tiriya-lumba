// src/routes/areaRoutes.ts
import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { cachePublicCdn } from '../middlewares/cacheControl';

import { getAreas } from '../controllers/areaController/get';
import { getAreaById } from '../controllers/areaController/getById';
import { createArea } from '../controllers/areaController/create';
import { updateArea } from '../controllers/areaController/update';
import { deleteArea } from '../controllers/areaController/delete';

const router = Router();

// Rute Publik (Tier 1: Vercel CDN Cache untuk dropdown filter daerah)
router.get('/', cachePublicCdn, getAreas);
router.get('/:id', cachePublicCdn, getAreaById);

// Rute Terproteksi (Hanya ADMIN yang dapat mengelola master data area)
router.post('/', authMiddleware, authorize('ADMIN'), createArea);
router.put('/:id', authMiddleware, authorize('ADMIN'), updateArea);
router.delete('/:id', authMiddleware, authorize('ADMIN'), deleteArea);

export default router;
