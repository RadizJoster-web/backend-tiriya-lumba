import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { cachePublicCdn } from '../middlewares/cacheControl';

import { getPublicLocations } from '../controllers/locationController/getPublicLocations';
import { getLocations } from '../controllers/locationController/get';
import { getLocationById } from '../controllers/locationController/getById';
import { createLocation } from '../controllers/locationController/create';
import { updateLocation } from '../controllers/locationController/update';
import { deleteLocation } from '../controllers/locationController/delete';

const router = Router();

// Public Routes (Tier 1: Vercel CDN Cache)
router.get('/public', cachePublicCdn, getPublicLocations);
router.get('/', cachePublicCdn, getLocations);
router.get('/:id', cachePublicCdn, getLocationById);

// Private Routes
router.post('/', authMiddleware, authorize('ADMIN'), createLocation);
router.put('/:id', authMiddleware, authorize('ADMIN'), updateLocation);
router.delete('/:id', authMiddleware, authorize('ADMIN'), deleteLocation);

export default router;
