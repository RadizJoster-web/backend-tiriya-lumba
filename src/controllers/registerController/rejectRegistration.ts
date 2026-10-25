import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';

const rejectSchema = z.object({
  rejectionReason: z
    .string({ message: 'Alasan penolakan wajib diisi.' })
    .min(3, { message: 'Alasan penolakan minimal 3 karakter.' }),
});

export const rejectRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramId = req.params.id;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    const currentUser = (req as any).user;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID pendaftaran tidak valid.',
      });
    }

    const { rejectionReason } = rejectSchema.parse(req.body);

    const registration = await prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Data pendaftaran tidak ditemukan.',
      });
    }

    // Role check: Pool Manager hanya boleh tolak siswa di kolamnya
    if (currentUser.role === 'POOL_MANAGER') {
      if (registration.type !== 'NEW_STUDENT') {
        return res.status(403).json({
          success: false,
          message:
            'Pengelola kolam hanya memiliki izin menolak pendaftaran murid.',
        });
      }
      if (registration.locationId !== currentUser.locationId) {
        return res.status(403).json({
          success: false,
          message:
            'Anda tidak memiliki hak akses untuk menolak pendaftaran di kolam ini.',
        });
      }
    }

    const updated = await prisma.registration.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Pendaftaran berhasil ditolak.',
      data: {
        registrationId: updated.id,
        status: updated.status,
        rejectionReason: updated.rejectionReason,
      },
    });
  } catch (error) {
    next(error);
  }
};
