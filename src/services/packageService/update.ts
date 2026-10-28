import { prisma } from '../../config/prisma';
import { packageIdParamSchema, updatePackageSchema } from './packageSchema';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';

export const updatePackageService = async (params: unknown, body: unknown) => {
  const { id } = packageIdParamSchema.parse(params);
  const validateData = updatePackageSchema.parse(body);

  const updated = await prisma.package.update({
    where: { id },
    data: validateData,
  });

  // Purge CDN cache tags di latar belakang
  revalidateVercelTags(['packages', 'locations']);

  return updated;
};
