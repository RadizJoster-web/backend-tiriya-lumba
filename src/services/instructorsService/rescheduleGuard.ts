import { AppError } from '../../utils/appError';
import { DAYS_ID } from './getRescheduleStatus';

export interface ScheduleWithLocation {
  id: string;
  locationId: string;
  dayOfWeek: string;
  sessionName: string;
  studentId: string | null;
  location?: { name: string } | null;
}

export interface ActiveRegistration {
  locationId: string | null;
  firstMeetDate: Date | null;
  firstMeetSession: string | null;
}

export interface NewScheduleItem {
  locationId: string;
  dayOfWeek: string;
  sessionName: string;
}

export function findActiveStudentSchedules(
  schedules: ScheduleWithLocation[],
  activeRegistrations: ActiveRegistration[],
): ScheduleWithLocation[] {
  return schedules.filter((s) => {
    if (s.studentId !== null) return true;
    return activeRegistrations.some((reg) => {
      if (!reg.firstMeetDate) return false;
      const d = new Date(reg.firstMeetDate);
      const dayName = DAYS_ID[d.getDay()];
      return (
        reg.locationId === s.locationId &&
        reg.firstMeetSession?.trim().toLowerCase() ===
          s.sessionName.trim().toLowerCase() &&
        dayName?.trim().toLowerCase() === s.dayOfWeek.trim().toLowerCase()
      );
    });
  });
}

export function validateRetainedSchedules(
  activeStudentSchedules: ScheduleWithLocation[],
  newSchedules: NewScheduleItem[],
): void {
  for (const active of activeStudentSchedules) {
    const isRetained = newSchedules.some(
      (ns) =>
        ns.locationId === active.locationId &&
        ns.dayOfWeek.trim().toLowerCase() === active.dayOfWeek.trim().toLowerCase() &&
        ns.sessionName.trim().toLowerCase() === active.sessionName.trim().toLowerCase(),
    );

    if (!isRetained) {
      throw new AppError(
        400,
        `Tidak dapat menghapus sesi ${active.dayOfWeek} (${active.sessionName}) di ${active.location?.name ?? 'Kolam'} karena ada murid aktif yang sedang dijadwalkan pada sesi tersebut.`,
      );
    }
  }
}
