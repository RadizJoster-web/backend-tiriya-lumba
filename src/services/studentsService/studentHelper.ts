export function calculateAge(birthDate?: Date | null): number {
  if (!birthDate) return 0;
  const diff = Date.now() - new Date(birthDate).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function calculateValidityDate(firstMeetDate?: Date | null, createdAt?: Date | null): string {
  if (firstMeetDate) {
    const d = new Date(firstMeetDate);
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  }
  if (createdAt) {
    const d = new Date(createdAt);
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  }
  return '-';
}
