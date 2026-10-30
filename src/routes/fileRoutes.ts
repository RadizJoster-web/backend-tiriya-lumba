import { Router } from 'express';
import { getFile } from '../controllers/fileController/getFile';

const router = Router();

// Mendukung format /api/files/:folder/:filename maupun /api/files/*
router.get('/:folder/:filename', getFile);
router.get('/*', getFile);

export default router;
