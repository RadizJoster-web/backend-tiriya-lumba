import { prisma } from '../../config/prisma';
import { createSessionSchema } from './sessionSchema';

export const createSessionService = async (body: unknown) => {
  const validatedData = createSessionSchema.parse(body);

  return prisma.sessionTime.create({
    data: validatedData,
  });
};
