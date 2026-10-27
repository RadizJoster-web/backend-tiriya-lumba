export function buildInstructorSnapshot(params: {
  user: any;
  instructorProfile: any;
  enrichedSchedules: any[];
  scheduleLabels: string[];
  registration?: any;
}) {
  const { user, instructorProfile, enrichedSchedules, scheduleLabels, registration } = params;
  return {
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
    cvUrl: registration?.cvUrl ?? '',
    registrationId: registration?.id ?? '',
    status: registration?.status ?? 'APPROVED',
    rejectionReason: registration?.rejectionReason ?? undefined,
    submittedAt: Date.now(),
    scheduleLabels,
  };
}

export function buildStudentSnapshot(params: {
  user: any;
  studentProfile: any;
  registration: any;
  packageData: any;
  location: any;
  instructor: any;
  timeRange: { startTime: string; endTime: string; formatted: string };
}) {
  const {
    user,
    studentProfile,
    registration,
    packageData,
    location,
    instructor,
    timeRange,
  } = params;

  return {
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
    startTime: timeRange.startTime,
    endTime: timeRange.endTime,
    timeRange: timeRange.formatted,
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
}
