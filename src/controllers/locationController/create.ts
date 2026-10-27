import { Request, Response, NextFunction } from 'express';
import { createLocationService } from '../../services/locationService/create';

export const createLocation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newLocation = await createLocationService(req.body);
    return res.status(201).json({
      success: true,
      message: 'Lokasi kolam baru berhasil ditambahkan.',
      data: newLocation,
    });
  } catch (err) {
    next(err);
  }
};
