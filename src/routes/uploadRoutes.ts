import { Router } from 'express';
const router = Router();

import { upload } from '../middlewares/uploadMiddleware';

import { uploadStudentProfile } from '../controllers/uploadController/uploadStudentProfile';

router.post(
  '/student/profil',
  upload.fields([{ name: 'profilePicture', maxCount: 1 }]),
  uploadStudentProfile,
);
router.post(
  '/student/payment',
  upload.fields([{ name: 'profilePicture', maxCount: 1 }]),
);

router.post(
  '/instructor',
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 },
    { name: 'paymentProof', maxCount: 1 },
  ]),
);

export default router;
