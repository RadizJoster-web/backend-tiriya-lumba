import { prisma } from '../../config/prisma';
import { packageIdParamSchema, updatePackageSchema } from './packageSchema';

export const updatePackageService = async (params: unknown, body: unknown) => {
  const { id } = packageIdParamSchema.parse(params);
  const validateData = updatePackageSchema.parse(body);

  return prisma.package.update({
    where: { id },
    data: validateData,
  });
};
