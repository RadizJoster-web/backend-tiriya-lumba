/**
 * Utilitas untuk memicu revalidasi on-demand cache di domain Landing Page (Next.js).
 * Dipanggil secara non-blocking setiap kali terjadi perubahan data pada Area, Lokasi, Paket, Sesi,
 * atau ketika admin menyetujui pendaftaran baru (memperbarui statistik publik).
 */
export async function revalidateCdn(tags: string[]): Promise<void> {
  if (!tags || tags.length === 0) return;

  const baseLanding = process.env.LANDING_PAGE_URL || process.env.URL_LANDING_PAGE || '';
  const revalidateUrl = baseLanding
    ? `${baseLanding.replace(/\/+$/, '')}/api/revalidate`
    : process.env.FRONTEND_REVALIDATE_URL ||
      process.env.LANDING_PAGE_REVALIDATE_URL ||
      'http://localhost:3000/api/revalidate';

  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    console.warn(
      '[revalidateCdn] REVALIDATE_SECRET tidak terdefinisi di environment. Revalidasi dibatalkan.',
    );
    return;
  }

  try {
    const res = await fetch(revalidateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({ tags }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn(
        `[revalidateCdn] Gagal revalidasi tag [${tags.join(', ')}]. Status: ${res.status}. Res: ${text}`,
      );
    }
  } catch (err) {
    console.warn(
      `[revalidateCdn] Tidak dapat menghubungi endpoint revalidasi: ${(err as Error)?.message}`,
    );
  }
}

export const revalidateVercelTags = revalidateCdn;
