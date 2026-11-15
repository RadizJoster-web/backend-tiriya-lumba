import { Request, Response, NextFunction } from 'express';
import { processPackageImageUpload } from '../../services/uploadService/uploadPackageImage';

export const uploadPackageImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await processPackageImageUpload(req.files as any);
    return res.status(200).json({
      success: true,
      message: 'Upload gambar paket berhasil.',
      data,
    });
  } catch (err) {
    next(err);
  }
};
