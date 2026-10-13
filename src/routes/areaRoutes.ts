// src/routes/areaRoutes.ts
import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';

import { getAreas } from '../controllers/areaController/get';
import { getAreaById } from '../controllers/areaController/getById';
import { createArea } from '../controllers/areaController/create';
import { updateArea } from '../controllers/areaController/update';
import { deleteArea } from '../controllers/areaController/delete';

const router = Router();

// Rute Publik (Digunakan frontend untuk dropdown filter daerah)
router.get('/', getAreas);
router.get('/:id', getAreaById);

// Rute Terproteksi (Hanya ADMIN yang dapat mengelola master data area)
router.post('/', authMiddleware, authorize('ADMIN'), createArea);

router.put('/:id', authMiddleware, authorize('ADMIN'), updateArea);

router.delete('/:id', authMiddleware, authorize('ADMIN'), deleteArea);

export default router;
