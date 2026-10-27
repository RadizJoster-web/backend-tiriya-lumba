import { Request, Response, NextFunction } from 'express';
import { updateAreaService } from '../../services/areaService/update';

export const updateArea = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updatedArea = await updateAreaService(req.params, req.body);
    return res.status(200).json({
      success: true,
      message: 'Data area berhasil diperbarui.',
      data: updatedArea,
    });
  } catch (error) {
    next(error);
  }
};
