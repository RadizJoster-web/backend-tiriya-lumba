import { prisma } from '../../config/prisma';
import { packageIdParamSchema } from './packageSchema';

export const deletePackageService = async (params: unknown) => {
  const { id } = packageIdParamSchema.parse(params);

  await prisma.package.delete({
    where: { id },
  });

  return true;
};
