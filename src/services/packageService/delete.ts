import { prisma } from '../../config/prisma';
import { packageIdParamSchema } from './packageSchema';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';

export const deletePackageService = async (params: unknown) => {
  const { id } = packageIdParamSchema.parse(params);

  await prisma.package.delete({
    where: { id },
  });

  // Purge CDN cache tags di latar belakang
  revalidateVercelTags(['packages', 'locations']);

  return true;
};
