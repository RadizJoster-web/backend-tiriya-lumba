import { Request, Response, NextFunction } from 'express';
import { registerInstructorService } from '../../services/registerService/registerInstructor';

export const registerInstructorController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.userId;
    const result = await registerInstructorService(userId, req.body);

    return res.status(201).json({
      success: true,
      message:
        'Pendaftaran instruktur dan deklarasi jadwal berhasil disimpan. Menunggu verifikasi admin.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
