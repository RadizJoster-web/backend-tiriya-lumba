import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { revalidateVercelTags } from '../../utils/revalidateWebhook';

const toggleCoachRegistrationSchema = z.object({
  isCoachRegistrationOpen: z.boolean().optional(),
});

export const toggleCoachRegistrationService = async (
  locationId: string,
  body?: unknown,
) => {
  const location = await prisma.location.findUnique({
    where: { id: locationId },
  });

  if (!location) {
    throw new AppError(404, 'Data lokasi kolam tidak ditemukan.');
  }

  const parsed = toggleCoachRegistrationSchema.safeParse(body);
  const nextStatus =
    parsed.success && typeof parsed.data.isCoachRegistrationOpen === 'boolean'
      ? parsed.data.isCoachRegistrationOpen
      : !location.isCoachRegistrationOpen;

  const updated = await prisma.location.update({
    where: { id: locationId },
    data: { isCoachRegistrationOpen: nextStatus },
  });

  // Revalidasi cache CDN di Vercel secara otomatis
  revalidateVercelTags(['locations', 'stats']);

  return {
    id: updated.id,
    name: updated.name,
    isCoachRegistrationOpen: updated.isCoachRegistrationOpen,
  };
};
