import { Request, Response, NextFunction } from 'express';
import { getLocationByIdService } from '../../services/locationService/getById';

export const getLocationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const location = await getLocationByIdService(req.params);
    return res.status(200).json({
      success: true,
      data: location,
    });
  } catch (err) {
    next(err);
  }
};
