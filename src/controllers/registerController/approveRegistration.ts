import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

export const approveRegistrationController = async (
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

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Data pendaftaran tidak ditemukan.',
      });
    }

    if (registration.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Pendaftaran ini sudah disetujui sebelumnya.',
      });
    }

    // Role check: Pool Manager hanya boleh approve siswa di kolamnya
    if (currentUser.role === 'POOL_MANAGER') {
      if (registration.type !== 'NEW_STUDENT') {
        return res.status(403).json({
          success: false,
          message:
            'Pengelola kolam hanya memiliki izin menyetujui pendaftaran murid.',
        });
      }
      if (registration.locationId !== currentUser.locationId) {
        return res.status(403).json({
          success: false,
          message:
            'Anda tidak memiliki hak akses untuk menyetujui pendaftaran di kolam ini.',
        });
      }
    }

    await prisma.$transaction(async (tx) => {
      // 1. Ubah status registrasi ke APPROVED
      await tx.registration.update({
        where: { id },
        data: {
          status: 'APPROVED',
          rejectionReason: null,
        },
      });

      // 2. Update user status & role sesuai jenis pendaftaran
      if (registration.type === 'NEW_INSTRUCTOR') {
        await tx.user.update({
          where: { id: registration.userId },
          data: {
            role: 'INSTRUCTOR',
            isActive: true,
          },
        });
      } else if (registration.type === 'NEW_STUDENT') {
        await tx.user.update({
          where: { id: registration.userId },
          data: {
            role: 'STUDENT',
            isActive: true,
          },
        });

        // Set default 4 sesi aktif untuk pertemuan pertama
        const studentProfile = await tx.studentProfile.findUnique({
          where: { userId: registration.userId },
        });

        if (studentProfile) {
          await tx.studentProfile.update({
            where: { userId: registration.userId },
            data: { activeSessions: 4 },
          });
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: `Pendaftaran ${registration.type === 'NEW_INSTRUCTOR' ? 'pelatih' : 'murid'} berhasil disetujui.`,
      data: {
        registrationId: registration.id,
        status: 'APPROVED',
      },
    });
  } catch (error) {
    next(error);
  }
};
