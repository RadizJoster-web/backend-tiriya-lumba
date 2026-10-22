import { Request, Response, NextFunction } from 'express';

export const uploadInstructorCv = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    const cvFile = files?.cv?.[0];
    const cvUrl = cvFile ? cvFile.path : null;

    return res.status(200).json({
      success: true,
      message: 'upload profile berhasil.',
      data: { cvUrl },
    });
  } catch (err) {
    next(err);
  }
};
