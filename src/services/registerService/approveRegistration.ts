import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { CurrentUserPayload } from './get';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';
import { validateStudentCapacityAndClash } from './studentCapacityGuard';
import { runTransactionWithRetry } from '../../utils/prismaTransaction';

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

  if (registration.status !== 'PENDING') {
    throw new AppError(
      400,
      `Pendaftaran sudah dalam status ${registration.status}.`,
    );
  }

  if (
    currentUser.role === 'POOL_MANAGER' &&
    currentUser.locationId &&
    registration.locationId !== currentUser.locationId
  ) {
    throw new AppError(
      403,
      'Akses ditolak. Anda hanya dapat menyetujui pendaftaran di lokasi kolam Anda.',
    );
  }

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
        'Data pendaftaran murid tidak lengkap untuk diverifikasi.',
      );
    }

    const [pkg, instructor] = await Promise.all([
      prisma.package.findUnique({ where: { id: registration.packageId } }),
      prisma.user.findFirst({
        where: { id: registration.instructorId, role: 'INSTRUCTOR' },
      }),
    ]);

    if (!pkg) throw new AppError(404, 'Paket tidak ditemukan.');
    if (!instructor) throw new AppError(404, 'Instruktur tidak ditemukan.');

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

  await runTransactionWithRetry(async (tx) => {
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
