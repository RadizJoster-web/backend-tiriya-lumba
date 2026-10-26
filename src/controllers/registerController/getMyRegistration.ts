import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

function getDayName(d: Date | string): string {
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '';
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[dateObj.getDay()] ?? '';
}

export const getMyRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.userId;

    // Ambil registrasi terbaru milik user ini beserta jadwal & profilnya
    const [registration, allSessionTimes] = await Promise.all([
      prisma.registration.findFirst({
        where: { userId },
        orderBy: { id: 'desc' },
        include: {
          user: {
            include: {
              studentProfile: true,
              instructorProfile: {
                include: { locations: true },
              },
              schedules: {
                include: { location: true },
              },
            },
          },
        },
      }),
      prisma.sessionTime.findMany(),
    ]);

    const enrichSchedules = async (schedules: any[], instructorId: string) => {
      // Ambil seluruh murid aktif yang disetujui untuk instruktur ini
      const approvedStudents = await prisma.registration.findMany({
        where: {
          instructorId,
          type: 'NEW_STUDENT',
          status: 'APPROVED',
        },
        include: {
          user: {
            include: {
              studentProfile: true,
            },
          },
        },
      });

      return schedules.map((s) => {
        const match = allSessionTimes.find(
          (st) =>
            st.dayOfWeek.trim().toLowerCase() === s.dayOfWeek.trim().toLowerCase() &&
            st.sessionName.trim().toLowerCase() === s.sessionName.trim().toLowerCase() &&
            (!st.locationId || st.locationId === s.locationId),
        );
        const startTime = match?.startTime ?? '';
        const endTime = match?.endTime ?? '';
        const timeRange = startTime && endTime ? `${startTime} - ${endTime} WIB` : '';
        const locationName = s.location?.name ?? 'Kolam';

        // Hitung total murid aktif yang terdaftar di sesi dan lokasi ini
        const studentCount = approvedStudents.filter((reg) => {
          if (reg.locationId && s.locationId && reg.locationId !== s.locationId) {
            return false;
          }

          const regSession = (reg.firstMeetSession || '').trim().toLowerCase();
          const schedSession = (s.sessionName || '').trim().toLowerCase();
          const sessionMatches =
            regSession === schedSession ||
            regSession.includes(schedSession) ||
            schedSession.includes(regSession);
          if (!sessionMatches) return false;

          if (reg.firstMeetDate) {
            const regDay = getDayName(reg.firstMeetDate).toLowerCase();
            const schedDay = (s.dayOfWeek || '').trim().toLowerCase();
            if (regDay && schedDay && regDay !== schedDay) return false;
          }

          const activeSessions = reg.user?.studentProfile?.activeSessions ?? 0;
          return activeSessions > 0;
        }).length;

        return {
          locationId: s.locationId,
          locationName,
          dayOfWeek: s.dayOfWeek,
          sessionName: s.sessionName,
          startTime,
          endTime,
          timeRange,
          totalStudents: studentCount,
        };
      });
    };

    if (!registration) {
      // Fallback jika user terdaftar sebagai INSTRUCTOR atau STUDENT tetapi baris Registration tidak ditemukan
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          instructorProfile: { include: { locations: true } },
          studentProfile: true,
          schedules: { include: { location: true } },
        },
      });

      if (existingUser && existingUser.role === 'INSTRUCTOR' && existingUser.instructorProfile) {
        const instructorProfile = existingUser.instructorProfile;
        const schedules = existingUser.schedules ?? [];
        const enrichedSchedules = await enrichSchedules(schedules, existingUser.id);
        const scheduleLabels = enrichedSchedules.map(
          (s) =>
            `${s.locationName} — ${s.dayOfWeek}, ${s.sessionName}${s.timeRange ? ` (${s.timeRange})` : ''}`,
        );

        return res.status(200).json({
          success: true,
          data: {
            kind: 'instructor',
            fullName: existingUser.fullName ?? '',
            phone: existingUser.phone ?? '',
            birthDate: instructorProfile?.birthDate
              ? new Date(instructorProfile.birthDate).toISOString().split('T')[0]
              : '',
            gender: 'Laki-Laki',
            address: '',
            shortBio: instructorProfile?.shortBio ?? '',
            license: instructorProfile?.license ?? '',
            experience: instructorProfile?.experience ?? '',
            schedules: enrichedSchedules,
            profilePictureUrl: existingUser.profilePictureUrl ?? '',
            cvUrl: '',
            registrationId: 'REG-' + existingUser.id.slice(0, 8),
            status: existingUser.isVerified ? 'APPROVED' : 'PENDING',
            submittedAt: Date.now(),
            scheduleLabels,
          },
        });
      }

      if (existingUser && existingUser.role === 'STUDENT' && existingUser.studentProfile) {
        const studentProfile = existingUser.studentProfile;
        return res.status(200).json({
          success: true,
          data: {
            kind: 'student',
            fullName: studentProfile?.fullName ?? existingUser.fullName ?? '',
            birthPlace: studentProfile?.birthPlace ?? '',
            birthDate: studentProfile?.birthDate
              ? new Date(studentProfile.birthDate).toISOString().split('T')[0]
              : '',
            gender: studentProfile?.gender ?? 'Laki-Laki',
            address: studentProfile?.address ?? '',
            phone: existingUser.phone ?? '',
            email: existingUser.email ?? '',
            schoolOrOffice: studentProfile?.schoolOrOffice ?? '',
            tshirtSize: studentProfile?.tshirtSize ?? 'M',
            activeSessions: studentProfile?.activeSessions ?? 0,
            locationId: '',
            packageId: '',
            firstMeetDate: '',
            firstMeetSession: '',
            instructorId: '',
            paymentMethod: 'BANK_TRANSFER',
            paymentProofUrl: '',
            profilePictureUrl: existingUser.profilePictureUrl ?? '',
            registrationId: 'REG-' + existingUser.id.slice(0, 8),
            status: existingUser.isVerified ? 'APPROVED' : 'PENDING',
            submittedAt: Date.now(),
            locationLabel: '',
            packageType: '',
            packagePrice: 0,
            instructorName: '',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const user = registration.user;

    if (registration.type === 'NEW_INSTRUCTOR') {
      const instructorProfile = user?.instructorProfile;
      const schedules = user?.schedules ?? [];
      const enrichedSchedules = await enrichSchedules(schedules, user?.id || userId);

      const scheduleLabels = enrichedSchedules.map(
        (s) =>
          `${s.locationName} — ${s.dayOfWeek}, ${s.sessionName}${s.timeRange ? ` (${s.timeRange})` : ''}`,
      );

      const snapshot = {
        kind: 'instructor',
        fullName: user?.fullName ?? '',
        phone: user?.phone ?? '',
        birthDate: instructorProfile?.birthDate
          ? new Date(instructorProfile.birthDate).toISOString().split('T')[0]
          : '',
        gender: 'Laki-Laki',
        address: '',
        shortBio: instructorProfile?.shortBio ?? '',
        license: instructorProfile?.license ?? '',
        experience: instructorProfile?.experience ?? '',
        schedules: enrichedSchedules,
        profilePictureUrl: user?.profilePictureUrl ?? '',
        cvUrl: registration.cvUrl ?? '',
        registrationId: registration.id,
        status: registration.status,
        rejectionReason: registration.rejectionReason ?? undefined,
        submittedAt: Date.now(),
        scheduleLabels,
      };

      return res.status(200).json({
        success: true,
        data: snapshot,
      });
    }

    // Untuk NEW_STUDENT
    const studentProfile = user?.studentProfile;
    const [packageData, location, instructor] = await Promise.all([
      registration.packageId
        ? prisma.package.findUnique({ where: { id: registration.packageId } })
        : null,
      registration.locationId
        ? prisma.location.findUnique({ where: { id: registration.locationId } })
        : null,
      registration.instructorId
        ? prisma.user.findUnique({
            where: { id: registration.instructorId },
            select: {
              fullName: true,
              profilePictureUrl: true,
              instructorProfile: {
                select: {
                  license: true,
                  experience: true,
                  shortBio: true,
                },
              },
            },
          })
        : null,
    ]);

    const snapshot = {
      kind: 'student',
      fullName: studentProfile?.fullName ?? user?.fullName ?? '',
      birthPlace: studentProfile?.birthPlace ?? '',
      birthDate: studentProfile?.birthDate
        ? new Date(studentProfile.birthDate).toISOString().split('T')[0]
        : '',
      gender: studentProfile?.gender ?? 'Laki-Laki',
      address: studentProfile?.address ?? '',
      phone: user?.phone ?? '',
      email: user?.email ?? '',
      schoolOrOffice: studentProfile?.schoolOrOffice ?? '',
      tshirtSize: studentProfile?.tshirtSize ?? 'M',
      activeSessions: studentProfile?.activeSessions ?? 0,
      locationId: registration.locationId ?? '',
      packageId: registration.packageId ?? '',
      firstMeetDate: registration.firstMeetDate
        ? new Date(registration.firstMeetDate).toISOString().split('T')[0]
        : '',
      firstMeetSession: registration.firstMeetSession ?? '',
      instructorId: registration.instructorId ?? '',
      paymentMethod: registration.paymentMethod ?? 'BANK_TRANSFER',
      paymentProofUrl: registration.paymentProofUrl ?? '',
      profilePictureUrl: user?.profilePictureUrl ?? '',
      registrationId: registration.id,
      status: registration.status,
      rejectionReason: registration.rejectionReason ?? undefined,
      submittedAt: Date.now(),
      locationLabel: location?.name ?? '',
      packageType: packageData?.type ?? '',
      packagePrice: packageData?.price ?? 0,
      instructorName: instructor?.fullName ?? '',
      instructorProfilePictureUrl: instructor?.profilePictureUrl ?? '',
      instructorLicense: instructor?.instructorProfile?.license ?? '',
      instructorExperience: instructor?.instructorProfile?.experience ?? '',
      instructorBio: instructor?.instructorProfile?.shortBio ?? '',
    };

    return res.status(200).json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    next(error);
  }
};
