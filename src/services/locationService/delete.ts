import { prisma } from '../../config/prisma';
import { locationIdParamSchema } from './locationSchema';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';

export const deleteLocationService = async (params: unknown) => {
  const { id } = locationIdParamSchema.parse(params);

  await prisma.location.delete({
    where: { id },
  });

  // Purge CDN cache tags di latar belakang
  revalidateVercelTags(['locations', 'stats']);

  return true;
};
