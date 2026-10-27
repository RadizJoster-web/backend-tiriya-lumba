import { prisma } from '../../config/prisma';
import {
  enrichInstructorSchedules,
  getDayName,
} from './myRegistrationHelper';
import {
  buildInstructorSnapshot,
  buildStudentSnapshot,
} from './registrationSnapshotBuilder';

export const getMyRegistrationService = async (userId: string) => {
  const [registration, allSessionTimes] = await Promise.all([
    prisma.registration.findFirst({
      where: { userId },
      orderBy: { id: 'desc' },
      include: {
        user: {
          include: {
            studentProfile: true,
            instructorProfile: { include: { locations: true } },
            schedules: { include: { location: true } },
          },
        },
      },
    }),
    prisma.sessionTime.findMany(),
  ]);

  if (!registration) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        instructorProfile: { include: { locations: true } },
        studentProfile: true,
        schedules: { include: { location: true } },
      },
    });

    if (existingUser?.role === 'INSTRUCTOR' && existingUser.instructorProfile) {
      const enrichedSchedules = await enrichInstructorSchedules(
        existingUser.schedules ?? [],
        existingUser.id,
        allSessionTimes,
      );
      const scheduleLabels = enrichedSchedules.map(
        (s) =>
          `${s.locationName} — ${s.dayOfWeek}, ${s.sessionName}${s.timeRange ? ` (${s.timeRange})` : ''}`,
      );
      return buildInstructorSnapshot({
        user: existingUser,
        instructorProfile: existingUser.instructorProfile,
        enrichedSchedules,
        scheduleLabels,
      });
    }

    return null;
  }

  const user = registration.user;

  if (registration.type === 'NEW_INSTRUCTOR') {
    const instructorProfile = user?.instructorProfile;
    const enrichedSchedules = await enrichInstructorSchedules(
      user?.schedules ?? [],
      registration.userId,
      allSessionTimes,
    );
    const scheduleLabels = enrichedSchedules.map(
      (s) =>
        `${s.locationName} — ${s.dayOfWeek}, ${s.sessionName}${s.timeRange ? ` (${s.timeRange})` : ''}`,
    );
    return buildInstructorSnapshot({
      user,
      instructorProfile,
      enrichedSchedules,
      scheduleLabels,
      registration,
    });
  }

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
              select: { license: true, experience: true, shortBio: true },
            },
          },
        })
      : null,
  ]);

  let startTime = '';
  let endTime = '';
  let formatted = '';

  if (registration.firstMeetSession) {
    const targetSession = registration.firstMeetSession.trim().toLowerCase();
    const meetDate = registration.firstMeetDate ? new Date(registration.firstMeetDate) : null;
    const regDay = meetDate ? getDayName(meetDate).toLowerCase() : '';

    const matchedSession =
      allSessionTimes.find((st) => {
        const sameSession = st.sessionName.trim().toLowerCase() === targetSession;
        const sameDay = !regDay || st.dayOfWeek.trim().toLowerCase() === regDay;
        const sameLoc = !st.locationId || st.locationId === registration.locationId;
        return sameSession && sameDay && sameLoc;
      }) ||
      allSessionTimes.find(
        (st) => st.sessionName.trim().toLowerCase() === targetSession,
      );

    if (matchedSession) {
      startTime = matchedSession.startTime;
      endTime = matchedSession.endTime;
      formatted = `${matchedSession.startTime.replace(':', '.')} - ${matchedSession.endTime.replace(':', '.')}`;
    }
  }

  return buildStudentSnapshot({
    user,
    studentProfile,
    registration,
    packageData,
    location,
    instructor,
    timeRange: { startTime, endTime, formatted },
  });
};
