import { prisma } from '../../config/prisma';
import { createPackageSchema } from './packageSchema';

export const createPackageService = async (body: unknown) => {
  const validateData = createPackageSchema.parse(body);

  return prisma.package.create({
    data: validateData,
  });
};
