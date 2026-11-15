import { Request, Response, NextFunction } from 'express';
import { processLocationImageUpload } from '../../services/uploadService/uploadLocationImage';

export const uploadLocationImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await processLocationImageUpload(req.files as any);
    return res.status(200).json({
      success: true,
      message: 'Upload foto kolam renang berhasil.',
      data,
    });
  } catch (err) {
    next(err);
  }
};
