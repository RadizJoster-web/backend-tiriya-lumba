import { prisma } from '../../config/prisma';
import { locationIdParamSchema } from './locationSchema';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';

export const deleteLocationService = async (params: unknown) => {
  const { id } = locationIdParamSchema.parse(params);

  // Bersihkan relasi dependent sebelum menghapus lokasi agar tidak ada record orphan
  await prisma.$transaction([
    prisma.schedule.deleteMany({ where: { locationId: id } }),
    prisma.package.deleteMany({ where: { locationId: id } }),
    prisma.sessionTime.deleteMany({ where: { locationId: id } }),
    prisma.user.updateMany({
      where: { locationId: id },
      data: { locationId: null },
    }),
    prisma.location.delete({
      where: { id },
    }),
  ]);

  // Purge CDN cache tags di latar belakang
  revalidateVercelTags(['locations', 'stats']);

  return true;
};
