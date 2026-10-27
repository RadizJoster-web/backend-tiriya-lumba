import { Request, Response, NextFunction } from 'express';
import { updateLocationService } from '../../services/locationService/update';

export const updateLocation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updatedLocation = await updateLocationService(req.params, req.body);
    return res.status(200).json({
      success: true,
      message: 'Data lokasi berhasil diperbarui.',
      data: updatedLocation,
    });
  } catch (err) {
    next(err);
  }
};
