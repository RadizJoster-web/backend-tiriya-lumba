import { Router } from 'express';
const router = Router();
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { packageController } from '../controllers/packageController';

// Public Route
router.get('/', packageController.getPackages);
router.get('/:id', packageController.getPackageById);

// Private Routes
router.post(
  '/',
  authMiddleware,
  authorize('ADMIN'),
  packageController.createPackage,
);

router.put(
  '/:id',
  authMiddleware,
  authorize('ADMIN'),
  packageController.updatePackage,
);

router.delete(
  '/:id',
  authMiddleware,
  authorize('ADMIN'),
  packageController.deletePackage,
);

export default router;
