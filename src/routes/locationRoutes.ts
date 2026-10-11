import { Router } from 'express';
const router = Router();
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { locationController } from '../controllers/locationController';

// Public Routes
router.get('/', locationController.getLocations);
router.get('/:id', locationController.getLocationById);

// Private Routes
router.post(
  '/',
  authMiddleware,
  authorize('ADMIN'),
  locationController.createLocation,
);

router.put(
  '/:id',
  authMiddleware,
  authorize('ADMIN'),
  locationController.updateLocation,
);

router.delete(
  '/:id',
  authMiddleware,
  authorize('ADMIN'),
  locationController.deleteLocation,
);

export default router;
