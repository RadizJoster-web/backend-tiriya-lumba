import { Router } from 'express';
const router = Router();

import { upload } from '../middlewares/uploadMiddleware';

import { uploadStudentProfile } from '../controllers/uploadController/uploadStudentProfile';
import { uploadInstructorCv } from '../controllers/uploadController/uploadInstructorCv';
import { uploadInstructorProfile } from '../controllers/uploadController/uploadInstructorProfile';

router.post(
  '/student/profile',
  upload.fields([{ name: 'profilePicture', maxCount: 1 }]),
  uploadStudentProfile,
);
router.post(
  '/student/payment',
  upload.fields([{ name: 'paymentProof', maxCount: 1 }]),
);

router.post(
  '/instructor/cv',
  upload.fields([{ name: 'cv', maxCount: 1 }]),
  uploadInstructorCv,
);
router.post(
  '/instructor/profile',
  upload.fields([{ name: 'profilePicture', maxCount: 1 }]),
  uploadInstructorProfile,
);

export default router;
