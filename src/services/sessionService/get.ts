import { prisma } from '../../config/prisma';
import { getSessionFilterSchema } from './sessionSchema';

export const getSessionsService = async (query: unknown) => {
  const { locationId, dayOfWeek } = getSessionFilterSchema.parse(query);

  return prisma.sessionTime.findMany({
    where: {
      dayOfWeek: dayOfWeek,
      OR: [
        { locationId: locationId },
        { locationId: null },
      ],
    },
    orderBy: [{ startTime: 'asc' }],
  });
};
