import { prisma } from '../../config/prisma';
import { locationIdParamSchema } from './locationSchema';

export const deleteLocationService = async (params: unknown) => {
  const { id } = locationIdParamSchema.parse(params);

  await prisma.location.delete({
    where: { id },
  });

  return true;
};
