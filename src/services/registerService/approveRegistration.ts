import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { CurrentUserPayload } from './get';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';

export const approveRegistrationService = async (
  id: string,
  currentUser: CurrentUserPayload,
) => {
  const registration = await prisma.registration.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!registration) {
    throw new AppError(404, 'Data pendaftaran tidak ditemukan.');
  }

  if (registration.status === 'APPROVED') {
    throw new AppError(400, 'Pendaftaran ini sudah disetujui sebelumnya.');
  }

  if (currentUser.role === 'POOL_MANAGER') {
    if (registration.type !== 'NEW_STUDENT') {
      throw new AppError(
        403,
        'Pengelola kolam hanya memiliki izin menyetujui pendaftaran murid.',
      );
    }
    if (registration.locationId !== currentUser.locationId) {
      throw new AppError(
        403,
        'Anda tidak memiliki hak akses untuk menyetujui pendaftaran di kolam ini.',
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.registration.update({
      where: { id },
      data: {
        status: 'APPROVED',
        rejectionReason: null,
      },
    });

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

      let activeSessions = 4;
      if (registration.packageId) {
        const pkg = await tx.package.findUnique({
          where: { id: registration.packageId },
          select: { sessionCount: true },
        });
        if (pkg?.sessionCount && pkg.sessionCount > 0) {
          activeSessions = Math.min(pkg.sessionCount, 10);
        }
      }

      const studentProfile = await tx.studentProfile.findUnique({
        where: { userId: registration.userId },
      });

      if (studentProfile) {
        await tx.studentProfile.update({
          where: { userId: registration.userId },
          data: { activeSessions },
        });
      }
    }
  });

  // Purge CDN cache stats di latar belakang karena jumlah murid/guru bertambah
  revalidateVercelTags(['stats']);

  return {
    registrationId: registration.id,
    type: registration.type,
    status: 'APPROVED',
  };
};
