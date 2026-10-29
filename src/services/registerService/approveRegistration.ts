import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { CurrentUserPayload } from './get';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';
import { validateStudentCapacityAndClash } from './studentCapacityGuard';

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

  // Jika pendaftaran murid, validasi ulang ketersediaan kuota dan slot pelatih
  if (registration.type === 'NEW_STUDENT') {
    if (
      !registration.instructorId ||
      !registration.locationId ||
      !registration.firstMeetDate ||
      !registration.firstMeetSession ||
      !registration.packageId
    ) {
      throw new AppError(
        400,
        'Data pendaftaran murid tidak lengkap (instruktur/lokasi/jadwal/paket kosong).',
      );
    }

    const [pkg, instructor] = await Promise.all([
      prisma.package.findUnique({ where: { id: registration.packageId } }),
      prisma.user.findFirst({
        where: { id: registration.instructorId, role: 'INSTRUCTOR' },
        select: { fullName: true },
      }),
    ]);

    if (!pkg) throw new AppError(404, 'Data paket les tidak ditemukan.');
    if (!instructor) throw new AppError(404, 'Data pelatih tidak ditemukan.');

    await validateStudentCapacityAndClash({
      userId: registration.userId,
      instructorId: registration.instructorId,
      instructorName: instructor.fullName,
      locationId: registration.locationId,
      firstMeetDate: registration.firstMeetDate.toISOString().slice(0, 10),
      firstMeetSession: registration.firstMeetSession,
      packageType: pkg.type,
    });
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

      let sessionCountToAdd = 4;
      if (registration.packageId) {
        const pkg = await tx.package.findUnique({
          where: { id: registration.packageId },
          select: { sessionCount: true },
        });
        if (pkg?.sessionCount && pkg.sessionCount > 0) {
          sessionCountToAdd = pkg.sessionCount;
        }
      }

      const studentProfile = await tx.studentProfile.findUnique({
        where: { userId: registration.userId },
      });

      if (studentProfile) {
        await tx.studentProfile.update({
          where: { userId: registration.userId },
          data: {
            activeSessions: (studentProfile.activeSessions || 0) + sessionCountToAdd,
          },
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
