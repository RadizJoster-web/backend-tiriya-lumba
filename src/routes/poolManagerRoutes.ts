// src/routes/poolManagerRoutes.ts
import { Router } from 'express';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';
import { privateOperational } from '../middlewares/cacheControl';

import { getPoolManagers } from '../controllers/poolManagerController/get';
import { getPoolManagerById } from '../controllers/poolManagerController/getById';
import { createPoolManager } from '../controllers/poolManagerController/create';
import { updatePoolManager } from '../controllers/poolManagerController/update';
import { deletePoolManager } from '../controllers/poolManagerController/delete';

const router = Router();

// Semua rute Pool Manager khusus untuk Super Admin (Tier 3: Private Data)
router.use(authMiddleware, authorize('ADMIN'));

router.get('/', privateOperational, getPoolManagers);
router.get('/:id', privateOperational, getPoolManagerById);
router.post('/', createPoolManager);
router.put('/:id', updatePoolManager);
router.delete('/:id', deletePoolManager);

export default router;
