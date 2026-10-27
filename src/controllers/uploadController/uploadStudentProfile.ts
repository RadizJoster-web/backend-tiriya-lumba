import { Request, Response, NextFunction } from 'express';
import { processStudentProfileUpload } from '../../services/uploadService/uploadStudentProfile';

export const uploadStudentProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = processStudentProfileUpload(req.files as any);
    return res.status(200).json({
      success: true,
      message: 'Upload profile berhasil.',
      data,
    });
  } catch (err) {
    next(err);
  }
};
