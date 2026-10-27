import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { registerInstructorSchema } from './registerSchema';

export const registerInstructorService = async (
  userId: string,
  body: unknown,
) => {
  const data = registerInstructorSchema.parse(body);

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      instructorProfile: true,
      registrations: {
        where: { type: 'NEW_INSTRUCTOR' },
        orderBy: { id: 'desc' },
        take: 1,
      },
    },
  });

  if (!existingUser) {
    throw new AppError(404, 'Pengguna tidak ditemukan.');
  }

  if (existingUser.role === 'INSTRUCTOR') {
    throw new AppError(
      400,
      'Anda sudah terdaftar sebagai instruktur aktif.',
    );
  }

  const latestInstructorReg = existingUser.registrations?.[0];
  if (latestInstructorReg && latestInstructorReg.status === 'PENDING') {
    throw new AppError(
      400,
      'Pendaftaran instruktur Anda sedang diproses dan menunggu verifikasi admin.',
    );
  }

  const uniqueLocationIds = Array.from(
    new Set(data.schedules.map((s) => s.locationId)),
  );

  const validLocations = await prisma.location.findMany({
    where: { id: { in: uniqueLocationIds } },
    select: { id: true },
  });

  if (validLocations.length !== uniqueLocationIds.length) {
    throw new AppError(
      404,
      'Salah satu atau lebih lokasi kolam yang dipilih tidak ditemukan.',
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        profilePictureUrl: data.profilePictureUrl || null,
      },
    });

    const instructorProfile = await tx.instructorProfile.upsert({
      where: { userId },
      create: {
        user: { connect: { id: userId } },
        shortBio: data.shortBio,
        birthDate: new Date(data.birthDate),
        license: data.license,
        experience: data.experience,
        locations: {
          connect: uniqueLocationIds.map((id) => ({ id })),
        },
      },
      update: {
        shortBio: data.shortBio,
        birthDate: new Date(data.birthDate),
        license: data.license,
        experience: data.experience,
        locations: {
          set: uniqueLocationIds.map((id) => ({ id })),
        },
      },
    });

    await tx.schedule.deleteMany({
      where: {
        instructorId: userId,
        studentId: null,
      },
    });

    await tx.schedule.createMany({
      data: data.schedules.map((schedule) => ({
        instructorId: userId,
        locationId: schedule.locationId,
        dayOfWeek: schedule.dayOfWeek,
        sessionName: schedule.sessionName,
        studentId: null,
      })),
    });

    let registration;
    if (latestInstructorReg && latestInstructorReg.status === 'REJECTED') {
      registration = await tx.registration.update({
        where: { id: latestInstructorReg.id },
        data: {
          status: 'PENDING',
          rejectionReason: null,
          cvUrl: data.cvUrl,
        },
      });
    } else {
      registration = await tx.registration.create({
        data: {
          userId,
          type: 'NEW_INSTRUCTOR',
          status: 'PENDING',
          cvUrl: data.cvUrl,
        },
      });
    }

    return { user: updatedUser, instructorProfile, registration };
  });

  return {
    registrationId: result.registration.id,
    fullName: result.user.fullName,
    phone: result.user.phone,
    totalSchedulesCreated: data.schedules.length,
    status: result.registration.status,
  };
};
