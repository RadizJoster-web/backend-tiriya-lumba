import { prisma } from '../../config/prisma';
import { createPackageSchema } from './packageSchema';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';

export const createPackageService = async (body: unknown) => {
  const validateData = createPackageSchema.parse(body);

  const created = await prisma.package.create({
    data: validateData,
  });

  // Purge CDN cache tags di latar belakang
  revalidateVercelTags(['packages', 'locations']);

  return created;
};
