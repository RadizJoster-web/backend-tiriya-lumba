import { Request, Response, NextFunction } from 'express';

/**
 * TIER 1: Public Master Data & Statistik (Wajib Cache di Vercel CDN)
 * Endpoint: /api/stats, /api/areas, /api/locations, /api/packages, /api/sessions
 */
export function cachePublicCdn(req: Request, res: Response, next: NextFunction): void {
  res.setHeader(
    'Cache-Control',
    'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
  );
  next();
}

/**
 * TIER 2: Real-Time High-Contention Data (DILARANG KERAS DI-CACHE)
 * Endpoint: /api/instructor/available, /api/instructors/reschedule/status
 */
export function noCacheRealtime(req: Request, res: Response, next: NextFunction): void {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

/**
 * TIER 3: Data Operasional, Presensi & Scoping POOL_MANAGER (DILARANG CACHE DI CDN)
 * Endpoint: /api/register/me, /api/register, /api/siswa, /api/instructor/management, /api/attendances, /api/pool-managers
 */
export function privateOperational(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
  res.setHeader('Vary', 'Authorization, Cookie');
  next();
}

/**
 * TIER 4: Agregasi Statistik Dasbor (Cache privat singkat di memori browser pengguna)
 * Endpoint: /api/dashboard/summary
 */
export function privateDashboardSummary(req: Request, res: Response, next: NextFunction): void {
  res.setHeader(
    'Cache-Control',
    'private, max-age=30, stale-while-revalidate=60',
  );
  res.setHeader('Vary', 'Authorization, Cookie');
  next();
}
