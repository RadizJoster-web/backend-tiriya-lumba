import { Request, Response, NextFunction } from 'express';
import { deleteAreaService } from '../../services/areaService/delete';

export const deleteArea = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteAreaService(req.params);
    return res.status(200).json({
      success: true,
      message: 'Area berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};
