import rateLimit from 'express-rate-limit';

// Rate Limiter Global (Untuk semua rute umum)
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Menit per max request
  max: 100, // Maximal 100 request
  standardHeaders: true, // Mengembalikan info rate limit di header 'RateLimit-*'
  legacyHeaders: false, // Mematikan header lama `X-RateLimit-*`
  message: {
    status: 429,
    error: 'Too Many Request',
    message: 'Terlalu banyak request, tunggu beberapa saat lagi',
  },
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    status: 429,
    error: 'Too Many Request',
    message: 'Terlalu banyak percobaan login, tunggu beberapa saat lagi',
  },
});
