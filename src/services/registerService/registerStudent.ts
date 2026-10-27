import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { registerStudentSchema } from './registerSchema';
import { validateStudentCapacityAndClash } from './studentCapacityGuard';

export const registerStudentService = async (userId: string, body: unknown) => {
  const data = registerStudentSchema.parse(body);

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      registrations: {
        where: { type: 'NEW_STUDENT' },
        orderBy: { id: 'desc' },
        take: 1,
      },
    },
  });

  if (!existingUser) {
    throw new AppError(404, 'Pengguna tidak ditemukan.');
  }

  if (
    existingUser.role === 'STUDENT' &&
    (existingUser.studentProfile?.activeSessions ?? 0) > 0
  ) {
    throw new AppError(
      400,
      'Email sudah terdaftar sebagai murid aktif dengan sisa pertemuan yang masih berjalan.',
    );
  }

  const latestStudentReg = existingUser.registrations?.[0];
  if (latestStudentReg && latestStudentReg.status === 'PENDING') {
    throw new AppError(
      400,
      'Pendaftaran Anda sedang diproses dan menunggu verifikasi admin.',
    );
  }

  const [location, packageData, instructor] = await Promise.all([
    prisma.location.findUnique({ where: { id: data.locationId } }),
    prisma.package.findUnique({ where: { id: data.packageId } }),
    prisma.user.findFirst({
      where: { id: data.instructorId, role: 'INSTRUCTOR' },
    }),
  ]);

  if (!location) throw new AppError(404, 'Lokasi tidak ditemukan');
  if (!packageData) throw new AppError(404, 'Paket tidak ditemukan');
  if (!instructor) throw new AppError(404, 'Instruktur tidak ditemukan');

  await validateStudentCapacityAndClash({
    userId,
    instructorId: data.instructorId,
    instructorName: instructor.fullName,
    locationId: data.locationId,
    firstMeetDate: data.firstMeetDate,
    firstMeetSession: data.firstMeetSession,
    packageType: packageData.type,
  });

  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        profilePictureUrl: data.profilePictureUrl || undefined,
      },
    });

    const studentProfile = await tx.studentProfile.upsert({
      where: { userId },
      create: {
        userId,
        fullName: data.fullName,
        birthPlace: data.birthPlace,
        birthDate: new Date(data.birthDate),
        gender: data.gender,
        address: data.address,
        schoolOrOffice: data.schoolOrOffice,
        tshirtSize: data.tshirtSize,
        activeSessions: 0,
      },
      update: {
        fullName: data.fullName,
        birthPlace: data.birthPlace,
        birthDate: new Date(data.birthDate),
        gender: data.gender,
        address: data.address,
        schoolOrOffice: data.schoolOrOffice,
        tshirtSize: data.tshirtSize,
      },
    });

    let registration;
    if (latestStudentReg) {
      registration = await tx.registration.update({
        where: { id: latestStudentReg.id },
        data: {
          status: 'PENDING',
          rejectionReason: null,
          packageId: data.packageId,
          locationId: data.locationId,
          instructorId: data.instructorId,
          firstMeetDate: new Date(data.firstMeetDate),
          firstMeetSession: data.firstMeetSession,
          paymentMethod: data.paymentMethod,
          paymentProofUrl: data.paymentProofUrl,
        },
      });

      await tx.registration.deleteMany({
        where: {
          userId,
          type: 'NEW_STUDENT',
          id: { not: registration.id },
        },
      });
    } else {
      registration = await tx.registration.create({
        data: {
          userId,
          type: 'NEW_STUDENT',
          status: 'PENDING',
          packageId: data.packageId,
          locationId: data.locationId,
          instructorId: data.instructorId,
          firstMeetDate: new Date(data.firstMeetDate),
          firstMeetSession: data.firstMeetSession,
          paymentMethod: data.paymentMethod,
          paymentProofUrl: data.paymentProofUrl,
        },
      });
    }

    return { user: updatedUser, studentProfile, registration };
  });

  return {
    registrationId: result.registration.id,
    fullName: result.studentProfile.fullName,
    status: result.registration.status,
  };
};
