import { Request, Response, NextFunction } from 'express';
import { processInstructorProfileUpload } from '../../services/uploadService/uploadInstructorProfile';

export const uploadInstructorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await processInstructorProfileUpload(req.files as any);
    return res.status(200).json({
      success: true,
      message: 'upload profile berhasil.',
      data,
    });
  } catch (err) {
    next(err);
  }
};
