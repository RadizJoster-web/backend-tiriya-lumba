import { Request, Response, NextFunction } from 'express';
import { processInstructorCvUpload } from '../../services/uploadService/uploadInstructorCv';

export const uploadInstructorCv = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = processInstructorCvUpload(req.files as any);
    return res.status(200).json({
      success: true,
      message: 'upload profile berhasil.',
      data,
    });
  } catch (err) {
    next(err);
  }
};
