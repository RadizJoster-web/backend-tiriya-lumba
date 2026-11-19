import { Request, Response, NextFunction } from 'express';
import { toggleCoachRegistrationService } from '../../services/monitoringService/toggleCoachRegistration';

export const toggleCoachRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = String(req.params.id);
    const result = await toggleCoachRegistrationService(id, req.body);
    return res.status(200).json({
      success: true,
      message: `Status pendaftaran pelatih kolam berhasil diubah menjadi ${
        result.isCoachRegistrationOpen ? 'BUKA' : 'TUTUP'
      }.`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
