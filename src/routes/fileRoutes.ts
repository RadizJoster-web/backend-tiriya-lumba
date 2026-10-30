import { Router } from 'express';
import { getFile } from '../controllers/fileController/getFile';

const router = Router();

// Express 5 format: /:folder/:filename dan fallback /{*path}
router.get('/:folder/:filename', getFile);
router.get('/{*path}', getFile);

export default router;
