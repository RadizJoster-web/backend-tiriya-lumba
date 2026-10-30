import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export const DEFAULT_TX_OPTIONS = {
  maxWait: 15000, // 15 detik batas menunggu alokasi koneksi
  timeout: 30000, // 30 detik batas eksekusi transaksi
};

/**
 * Menjalankan transaksi Prisma interaktif dengan batas waktu aman untuk Vercel Serverless & TiDB Cloud,
 * serta retry otomatis bila terjadi kendala timeout sesaat (P2028 / P2024).
 */
export async function runTransactionWithRetry<T>(
  action: (tx: Prisma.TransactionClient) => Promise<T>,
  options = DEFAULT_TX_OPTIONS,
  maxRetries = 2,
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await prisma.$transaction(action, options);
    } catch (err: any) {
      attempt++;
      const isTransientTxError =
        err?.code === 'P2028' ||
        err?.code === 'P2024' ||
        err?.message?.includes('Transaction') ||
        err?.message?.includes('timed out');

      if (isTransientTxError && attempt <= maxRetries) {
        console.warn(
          `[Prisma Transaction Retry] Percobaan ke-${attempt} gagal (${err?.code || 'timeout'}). Mengulang dalam 500ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        continue;
      }

      throw err;
    }
  }
}
