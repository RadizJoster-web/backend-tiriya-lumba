import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { cachePublicCdn } from '../middlewares/cacheControl';

import { getPackages } from '../controllers/packageController/get';
import { getPackageById } from '../controllers/packageController/getById';
import { createPackage } from '../controllers/packageController/create';
import { updatePackage } from '../controllers/packageController/update';
import { deletePackage } from '../controllers/packageController/delete';

const router = Router();

// Public Route (Tier 1: Vercel CDN Cache)
router.get('/', cachePublicCdn, getPackages);
router.get('/:id', cachePublicCdn, getPackageById);

// Private Routes
router.post('/', authMiddleware, authorize('ADMIN'), createPackage);
router.put('/:id', authMiddleware, authorize('ADMIN'), updatePackage);
router.delete('/:id', authMiddleware, authorize('ADMIN'), deletePackage);

export default router;
