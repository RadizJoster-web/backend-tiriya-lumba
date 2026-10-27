export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agt',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export interface RegistrationRecord {
  createdAt: Date;
}

export function buildYearChartData(registrations: RegistrationRecord[], year: number) {
  const monthlyCounts = MONTHS_SHORT.map((_, monthIndex) => {
    return registrations.filter((r) => {
      return new Date(r.createdAt).getMonth() === monthIndex;
    }).length;
  });

  const totalPendaftar = monthlyCounts.reduce((a, b) => a + b, 0);

  return {
    data: monthlyCounts,
    labels: MONTHS_SHORT,
    total: totalPendaftar,
    title: `Tren Pendaftaran Tahun ${year}`,
    subtitle: `Data pendaftaran per bulan untuk tahun ${year}`,
    statLabel: `Total pendaftar (${year})`,
  };
}

export function buildMonthChartData(
  registrations: RegistrationRecord[],
  monthIdx: number,
  year: number,
) {
  const monthFiltered = registrations.filter((r) => {
    return new Date(r.createdAt).getMonth() === monthIdx;
  });

  const weekLabels = [
    'Mgg 1 (1-7)',
    'Mgg 2 (8-14)',
    'Mgg 3 (15-21)',
    'Mgg 4 (22-28)',
    'Mgg 5 (29-31)',
  ];

  const weeklyCounts = [
    monthFiltered.filter((r) => {
      const date = new Date(r.createdAt).getDate();
      return date >= 1 && date <= 7;
    }).length,
    monthFiltered.filter((r) => {
      const date = new Date(r.createdAt).getDate();
      return date >= 8 && date <= 14;
    }).length,
    monthFiltered.filter((r) => {
      const date = new Date(r.createdAt).getDate();
      return date >= 15 && date <= 21;
    }).length,
    monthFiltered.filter((r) => {
      const date = new Date(r.createdAt).getDate();
      return date >= 22 && date <= 28;
    }).length,
    monthFiltered.filter((r) => {
      const date = new Date(r.createdAt).getDate();
      return date >= 29;
    }).length,
  ];

  const monthName = MONTH_NAMES[monthIdx] ?? `Bulan ${monthIdx + 1}`;
  const totalPendaftar = weeklyCounts.reduce((a, b) => a + b, 0);

  return {
    data: weeklyCounts,
    labels: weekLabels,
    total: totalPendaftar,
    title: `Tren Pendaftaran ${monthName} ${year}`,
    subtitle: `Distribusi pendaftaran per minggu di bulan ${monthName} ${year}`,
    statLabel: `Total pendaftar (${monthName} ${year})`,
  };
}
