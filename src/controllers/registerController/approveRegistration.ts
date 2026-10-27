import { Request, Response, NextFunction } from 'express';
import { approveRegistrationService } from '../../services/registerService/approveRegistration';

export const approveRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramId = req.params.id;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    const currentUser = (req as any).user;

    const result = await approveRegistrationService(id as string, currentUser);

    return res.status(200).json({
      success: true,
      message: `Pendaftaran ${result.type === 'NEW_INSTRUCTOR' ? 'pelatih' : 'murid'} berhasil disetujui.`,
      data: {
        registrationId: result.registrationId,
        status: result.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
