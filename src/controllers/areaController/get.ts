import { Request, Response, NextFunction } from 'express';
import { getAreasService } from '../../services/areaService/get';

export const getAreas = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const areas = await getAreasService();
    return res.status(200).json({
      success: true,
      data: areas,
    });
  } catch (error) {
    next(error);
  }
};
