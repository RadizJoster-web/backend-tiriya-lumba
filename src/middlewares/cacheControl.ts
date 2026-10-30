import { Request, Response, NextFunction } from 'express';

/**
 * TIER 1: Public Master Data & Statistik (Cache di Vercel Edge CDN)
 * Endpoint GET: /api/stats, /api/areas, /api/areas/:id, /api/locations,
 * /api/locations/:id, /api/packages, /api/packages/:id, /api/sessions, /api/sessions/:id
 */
export function publicEdgeCache(req: Request, res: Response, next: NextFunction): void {
  res.setHeader(
    'Cache-Control',
    'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
  );
  next();
}

/**
 * TIER 2: Real-Time High-Contention Data (Mutual Exclusion Clash Guard)
 * Endpoint GET: /api/instructor/available, /api/instructors/reschedule/status
 */
export function realTimeNoCache(req: Request, res: Response, next: NextFunction): void {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

/**
 * TIER 3: Data Operasional, Presensi & Scoping POOL_MANAGER (Private RBAC)
 * Endpoint GET: /api/register/me, /api/register, /api/register/:id, /api/siswa,
 * /api/students, /api/instructor/management, /api/attendances/today,
 * /api/attendances/my-history, /api/attendances, /api/pool-managers, /api/pool-managers/:id
 */
export function privateRbacNoCache(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
  res.setHeader('Vary', 'Authorization, Cookie');
  next();
}

/**
 * TIER 4: Agregasi Ringkasan Dasbor (Private Browser Cache)
 * Endpoint GET: /api/dashboard/summary
 */
export function privateSummaryCache(req: Request, res: Response, next: NextFunction): void {
  res.setHeader(
    'Cache-Control',
    'private, max-age=30, stale-while-revalidate=60',
  );
  res.setHeader('Vary', 'Authorization, Cookie');
  next();
}

// Aliases for backward compatibility
export const cachePublicCdn = publicEdgeCache;
export const noCacheRealtime = realTimeNoCache;
export const privateOperational = privateRbacNoCache;
export const privateDashboardSummary = privateSummaryCache;
