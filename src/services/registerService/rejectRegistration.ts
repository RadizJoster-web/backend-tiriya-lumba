import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { rejectSchema } from './registerSchema';
import { CurrentUserPayload } from './get';

export const rejectRegistrationService = async (
  id: string,
  currentUser: CurrentUserPayload,
  body: unknown,
) => {
  const { rejectionReason } = rejectSchema.parse(body);

  const registration = await prisma.registration.findUnique({
    where: { id },
  });

  if (!registration) {
    throw new AppError(404, 'Data pendaftaran tidak ditemukan.');
  }

  if (registration.status === 'REJECTED') {
    throw new AppError(400, 'Pendaftaran ini sudah ditolak sebelumnya.');
  }

  if (registration.status === 'APPROVED') {
    throw new AppError(
      400,
      'Pendaftaran ini sudah berstatus disetujui dan tidak dapat ditolak secara sepihak.',
    );
  }

  if (currentUser.role === 'POOL_MANAGER') {
    if (registration.type !== 'NEW_STUDENT') {
      throw new AppError(
        403,
        'Pengelola kolam hanya memiliki izin menolak pendaftaran murid.',
      );
    }
    if (registration.locationId !== currentUser.locationId) {
      throw new AppError(
        403,
        'Anda tidak memiliki hak akses untuk menolak pendaftaran di kolam ini.',
      );
    }
  }

  const [updated] = await prisma.$transaction([
    prisma.registration.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason,
      },
    }),
    prisma.user.update({
      where: { id: registration.userId },
      data: {
        role: 'USER',
      },
    }),
  ]);

  return {
    registrationId: updated.id,
    status: updated.status,
    rejectionReason: updated.rejectionReason,
  };
};
