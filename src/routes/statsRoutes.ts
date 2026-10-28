import { Router } from 'express';
import { getPublicStats } from '../controllers/statsController';
import { cachePublicCdn } from '../middlewares/cacheControl';

const router = Router();

// Endpoint publik statistik total murid & guru untuk landing page (Tier 1: Vercel CDN)
router.get('/', cachePublicCdn, getPublicStats);

export default router;
