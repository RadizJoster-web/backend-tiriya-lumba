import { Request, Response, NextFunction } from 'express';
import { deleteLocationService } from '../../services/locationService/delete';

export const deleteLocation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteLocationService(req.params);
    return res.status(200).json({
      success: true,
      message: 'Lokasi kolam berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};
