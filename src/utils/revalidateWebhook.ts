/**
 * Mengirimkan sinyal on-demand cache invalidation ke Next.js Vercel Edge CDN webhook.
 * Berjalan di latar belakang (non-blocking) agar tidak menghambat response API.
 */
export async function revalidateVercelTags(tags: string[]): Promise<void> {
  if (!tags || tags.length === 0) return;

  const revalidateUrl =
    process.env.FRONTEND_REVALIDATE_URL ||
    process.env.LANDING_PAGE_REVALIDATE_URL ||
    'http://localhost:3000/api/revalidate';
  const secret = process.env.REVALIDATE_SECRET || 'tirya-lumba-revalidate-secret-key';

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
        `[revalidateWebhook] Gagal revalidasi tag [${tags.join(', ')}]. Status: ${res.status}. Res: ${text}`,
      );
    }
  } catch (err) {
    // Non-blocking: tangkap error jaringan agar tidak mengganggu alur transaksi
    console.warn(
      `[revalidateWebhook] Tidak dapat menghubungi endpoint revalidasi: ${(err as Error)?.message}`,
    );
  }
}
