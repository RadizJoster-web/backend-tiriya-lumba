import { Router } from 'express';
const router = Router();
import { authMiddleware, authorize } from '../middlewares/authMiddleware';

import { getPublicLocations } from '../controllers/locationController/getPublicLocations';
import { getLocations } from '../controllers/locationController/get';
import { getLocationById } from '../controllers/locationController/getById';
import { createLocation } from '../controllers/locationController/create';
import { updateLocation } from '../controllers/locationController/update';
import { deleteLocation } from '../controllers/locationController/delete';

// Public Routes
router.get('/public', getPublicLocations);
router.get('/', getLocations);
router.get('/:id', getLocationById);

// Private Routes
router.post('/', authMiddleware, authorize('ADMIN'), createLocation);
router.put('/:id', authMiddleware, authorize('ADMIN'), updateLocation);
router.delete('/:id', authMiddleware, authorize('ADMIN'), deleteLocation);

export default router;
