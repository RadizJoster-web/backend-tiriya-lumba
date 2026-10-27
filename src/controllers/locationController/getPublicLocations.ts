import { Request, Response, NextFunction } from 'express';
import { getPublicLocationsService } from '../../services/locationService/getPublicLocations';

export const getPublicLocations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getPublicLocationsService(req.query);
    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
