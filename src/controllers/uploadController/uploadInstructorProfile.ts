import { Request, Response, NextFunction } from 'express';

export const uploadInstructorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const profilePictureFile = files?.profilePicture?.[0];
  const profilePictureUrl = profilePictureFile ? profilePictureFile.path : null;

  return res.status(200).json({
    success: true,
    message: 'upload profile berhasil.',
    data: { profilePictureUrl },
  });
};
