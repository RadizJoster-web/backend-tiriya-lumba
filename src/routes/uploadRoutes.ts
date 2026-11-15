import { Router } from 'express';
import { upload, validateMagicBytesMiddleware } from '../middlewares/uploadMiddleware';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';

import { uploadStudentProfile } from '../controllers/uploadController/uploadStudentProfile';
import { uploadStudentPayment } from '../controllers/uploadController/uploadStudentPayment';
import { uploadInstructorCv } from '../controllers/uploadController/uploadInstructorCv';
import { uploadInstructorProfile } from '../controllers/uploadController/uploadInstructorProfile';
import { uploadLocationImage } from '../controllers/uploadController/uploadLocationImage';

const router = Router();

// Wajib autentikasi untuk seluruh upload berkas
router.use(authMiddleware);

router.post(
  ['/student/profile', '/student/profil'],
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'profilePictures', maxCount: 1 },
  ]),
  validateMagicBytesMiddleware,
  uploadStudentProfile,
);

router.post(
  ['/student/payment', '/student/pembayaran'],
  upload.fields([
    { name: 'paymentProof', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 },
  ]),
  validateMagicBytesMiddleware,
  uploadStudentPayment,
);

router.post(
  '/instructor/cv',
  upload.fields([{ name: 'cv', maxCount: 1 }]),
  validateMagicBytesMiddleware,
  uploadInstructorCv,
);

router.post(
  ['/instructor/profile', '/instructor/profil'],
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'profilePictures', maxCount: 1 },
  ]),
  validateMagicBytesMiddleware,
  uploadInstructorProfile,
);

router.post(
  ['/location', '/pool'],
  authorize('ADMIN'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'locationImage', maxCount: 1 },
  ]),
  validateMagicBytesMiddleware,
  uploadLocationImage,
);

export default router;
