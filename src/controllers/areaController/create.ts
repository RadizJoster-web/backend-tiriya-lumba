import { Request, Response, NextFunction } from 'express';
import { createAreaService } from '../../services/areaService/create';

export const createArea = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newArea = await createAreaService(req.body);
    return res.status(201).json({
      success: true,
      message: 'Area baru berhasil ditambahkan.',
      data: newArea,
    });
  } catch (error) {
    next(error);
  }
};
