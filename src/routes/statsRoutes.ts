import { Router } from 'express';
import { getPublicStats } from '../controllers/statsController';

const router = Router();

// Endpoint publik statistik total murid & guru untuk landing page
router.get('/', getPublicStats);

export default router;
