import { CorsOptions } from 'cors';

function isAllowedOrigin(origin: string): boolean {
  const allowedFromEnv = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const fallbackLanding = process.env.URL_LANDING_PAGE?.trim();
  const fallbackDashboard = process.env.URL_DASHBOARD_PAGE?.trim();
  if (fallbackLanding) allowedFromEnv.push(fallbackLanding);
  if (fallbackDashboard) allowedFromEnv.push(fallbackDashboard);

  if (allowedFromEnv.includes(origin)) return true;

  try {
    const parsed = new URL(origin);
    const host = parsed.hostname.toLowerCase();

    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.endsWith('.vercel.app')
    ) {
      return true;
    }
  } catch {
    // Malformed origin
    return false;
  }

  return false;
}

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Akses diblokir oleh kebijakan CORS (Origin Not Allowed)'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cookie',
    'x-revalidate-secret',
    'Cache-Control',
  ],
};
