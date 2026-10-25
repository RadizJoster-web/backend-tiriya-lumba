import { Router } from 'express';
const router = Router();

import { upload } from '../middlewares/uploadMiddleware';

import { uploadStudentProfile } from '../controllers/uploadController/uploadStudentProfile';
import { uploadStudentPayment } from '../controllers/uploadController/uploadStudentPayment';
import { uploadInstructorCv } from '../controllers/uploadController/uploadInstructorCv';
import { uploadInstructorProfile } from '../controllers/uploadController/uploadInstructorProfile';

router.post(
  ['/student/profile', '/student/profil'],
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'profilePictures', maxCount: 1 },
  ]),
  uploadStudentProfile,
);

router.post(
  ['/student/payment', '/student/pembayaran'],
  upload.fields([
    { name: 'paymentProof', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 },
  ]),
  uploadStudentPayment,
);

router.post(
  '/instructor/cv',
  upload.fields([{ name: 'cv', maxCount: 1 }]),
  uploadInstructorCv,
);

router.post(
  ['/instructor/profile', '/instructor/profil'],
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'profilePictures', maxCount: 1 },
  ]),
  uploadInstructorProfile,
);

export default router;
