import { prisma } from '../../config/prisma';
import {
  CoachAllocation,
  PoolCapacityItem,
  PoolCapacityResponse,
  StudentAllocation,
} from './types';

export interface CurrentUserPayload {
  role?: string;
  locationId?: string | null;
}

export const getPoolCapacityService = async (
  currentUser?: CurrentUserPayload,
): Promise<PoolCapacityResponse> => {
  const [locations, students, instructors, packages] = await Promise.all([
    prisma.location.findMany({
      where:
        currentUser?.role === 'POOL_MANAGER' && currentUser.locationId
          ? { id: currentUser.locationId }
          : {},
      include: {
        area: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'STUDENT', isActive: true },
      select: {
        id: true,
        fullName: true,
        phone: true,
        isActive: true,
        studentProfile: {
          select: { fullName: true, activeSessions: true },
        },
        registrations: {
          where: { type: 'NEW_STUDENT', status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            locationId: true,
            instructorId: true,
            firstMeetDate: true,
            firstMeetSession: true,
            packageId: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: 'INSTRUCTOR', isActive: true },
      select: {
        id: true,
        fullName: true,
        phone: true,
        profilePictureUrl: true,
        instructorProfile: {
          select: {
            locations: { select: { id: true } },
          },
        },
        schedules: {
          select: { locationId: true },
        },
      },
      orderBy: { fullName: 'asc' },
    }),
    prisma.package.findMany({ select: { id: true, type: true } }),
  ]);

  const packageMap = new Map(packages.map((p) => [p.id, p.type]));

  // Kelompokkan murid aktif berdasarkan kunci `${locationId}_${instructorId}`
  const studentsByLocationAndCoach = new Map<string, StudentAllocation[]>();
  for (const s of students) {
    const reg = s.registrations[0];
    if (!reg?.locationId || !reg?.instructorId) continue;
    const key = `${reg.locationId}_${reg.instructorId}`;
    if (!studentsByLocationAndCoach.has(key)) {
      studentsByLocationAndCoach.set(key, []);
    }
    studentsByLocationAndCoach.get(key)!.push({
      id: s.id,
      name: s.studentProfile?.fullName || s.fullName,
      phone: s.phone ?? null,
      packageName: reg.packageId ? packageMap.get(reg.packageId) ?? 'Reguler' : 'Reguler',
      firstMeetDate: reg.firstMeetDate ? reg.firstMeetDate.toISOString().slice(0, 10) : null,
      firstMeetSession: reg.firstMeetSession ?? null,
      isActive: s.isActive,
      activeSessions: s.studentProfile?.activeSessions ?? 0,
    });
  }

  const pools: PoolCapacityItem[] = locations.map((loc) => {
    // Cari instruktur yang mengajar di kolam ini
    const poolCoaches: CoachAllocation[] = [];
    for (const inst of instructors) {
      const assignedProfileLocations = inst.instructorProfile?.locations?.map((l) => l.id) || [];
      const assignedScheduleLocations = inst.schedules?.map((s) => s.locationId) || [];
      const teachesHere =
        assignedProfileLocations.includes(loc.id) ||
        assignedScheduleLocations.includes(loc.id);

      if (teachesHere) {
        const key = `${loc.id}_${inst.id}`;
        const allocatedStudents = studentsByLocationAndCoach.get(key) || [];
        poolCoaches.push({
          id: inst.id,
          fullName: inst.fullName,
          phone: inst.phone ?? null,
          profilePictureUrl: inst.profilePictureUrl ?? null,
          totalStudents: allocatedStudents.length,
          students: allocatedStudents,
        });
      }
    }

    const totalStudentsAtPool = poolCoaches.reduce((sum, c) => sum + c.totalStudents, 0);

    return {
      id: loc.id,
      name: loc.name,
      category: loc.category,
      imageUrl: loc.imageUrl ?? null,
      mapUrl: loc.mapUrl ?? null,
      areaName: loc.area?.name ?? null,
      isCoachRegistrationOpen: loc.isCoachRegistrationOpen,
      totalInstructors: poolCoaches.length,
      totalStudents: totalStudentsAtPool,
      coaches: poolCoaches,
    };
  });

  return {
    globalStats: {
      totalActiveInstructors: instructors.length,
      totalActiveStudents: students.length,
    },
    pools,
  };
};
