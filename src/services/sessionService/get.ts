import { prisma } from '../../config/prisma';
import { getSessionFilterSchema } from './sessionSchema';

export const getSessionsService = async (query: unknown) => {
  const { locationId, dayOfWeek } = getSessionFilterSchema.parse(query);

  const whereClause: Record<string, unknown> = {};
  if (dayOfWeek) {
    whereClause.dayOfWeek = dayOfWeek;
  }
  if (locationId) {
    whereClause.OR = [
      { locationId: locationId },
      { locationId: null },
    ];
  }

  return prisma.sessionTime.findMany({
    where: whereClause,
    orderBy: [{ startTime: 'asc' }],
  });
};
