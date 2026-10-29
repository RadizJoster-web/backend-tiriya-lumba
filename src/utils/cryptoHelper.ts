import crypto from 'crypto';

/**
 * Membuat hash SHA-256 satu arah untuk token sensitif (OTP, reset password token)
 * sebelum disimpan ke database, dengan opsi salt unik untuk mencegah serangan rainbow table.
 */
export function hashToken(value: string, salt: string = ''): string {
  const payload = salt ? `${salt}:${value}` : value;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Membandingkan dua string (misal token hash atau secret) secara timing-safe
 * untuk mencegah serangan Side-Channel Timing Attack.
 */
export function timingSafeMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
