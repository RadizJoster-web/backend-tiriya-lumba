import { Router } from 'express';
const router = Router();
import { authMiddleware, authorize } from '../middlewares/authMiddleware';

import { getPackages } from '../controllers/packageController/get';
import { getPackageById } from '../controllers/packageController/getById';
import { createPackage } from '../controllers/packageController/create';
import { updatePackage } from '../controllers/packageController/update';
import { deletePackage } from '../controllers/packageController/delete';

// Public Route
router.get('/', getPackages);
router.get('/:id', getPackageById);

// Private Routes
router.post('/', authMiddleware, authorize('ADMIN'), createPackage);
router.put('/:id', authMiddleware, authorize('ADMIN'), updatePackage);
router.delete('/:id', authMiddleware, authorize('ADMIN'), deletePackage);

export default router;
