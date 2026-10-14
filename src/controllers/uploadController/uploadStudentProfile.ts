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

    const profilePictureFile = files?.profilePictures?.[0];
    const profilePictureUrl = profilePictureFile
      ? profilePictureFile.path
      : null;

    const bodyData = req.body;

    return res.status(200).json({
      success: true,
      message: 'upload profile berhasil.',
      data: {
        ...bodyData,
        profilePictureUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};
