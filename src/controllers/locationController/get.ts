import { Request, Response, NextFunction } from 'express';
import { getLocationsService } from '../../services/locationService/get';

export const getLocations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const locations = await getLocationsService();
    return res.status(200).json({
      success: true,
      data: locations,
    });
  } catch (err) {
    next(err);
  }
};
