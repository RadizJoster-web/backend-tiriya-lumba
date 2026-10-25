import { Request, Response, NextFunction } from 'express';

export const uploadStudentProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    const profilePictureFile =
      files?.profilePicture?.[0] || files?.profilePictures?.[0];
    const profilePictureUrl = profilePictureFile
      ? profilePictureFile.path
      : null;

    return res.status(200).json({
      success: true,
      message: 'Upload profile berhasil.',
      data: { profilePictureUrl },
    });
  } catch (err) {
    next(err);
  }
};
