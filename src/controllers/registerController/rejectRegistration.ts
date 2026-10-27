import { Request, Response, NextFunction } from 'express';
import { rejectRegistrationService } from '../../services/registerService/rejectRegistration';

export const rejectRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramId = req.params.id;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    const currentUser = (req as any).user;

    const result = await rejectRegistrationService(
      id as string,
      currentUser,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: 'Pendaftaran berhasil ditolak.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
