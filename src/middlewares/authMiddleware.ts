import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import jwt from 'jsonwebtoken';
export { authorize } from './authorize';

interface JwtPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'POOL_MANAGER' | 'INSTRUCTOR' | 'STUDENT' | 'USER';
  locationId?: string | null;
}

const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  isVerified: true,
  locationId: true,
} as const;

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let headerToken: string | undefined;
    let cookieToken: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      headerToken = req.headers.authorization.split(' ')[1];
    }
    if (req.cookies?.access_token) {
      cookieToken = req.cookies.access_token;
    }

    const candidates = [headerToken, cookieToken].filter(
      (t): t is string => Boolean(t) && t !== 'undefined' && t !== 'null',
    );

    if (candidates.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token autentikasi tidak ditemukan.',
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('FATAL: JWT_SECRET environment variable is not defined.');
    }

    let decoded: JwtPayload | null = null;
    let lastError: any = null;

    for (const cand of candidates) {
      try {
        decoded = jwt.verify(cand, secret, {
          algorithms: ['HS256'],
        }) as JwtPayload;
        if (decoded) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!decoded) {
      if (lastError?.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Sesi Anda telah berakhir (Token Expired). Silakan login kembali.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Token autentikasi tidak valid.',
      });
    }

    // Query DB via PK dengan toleransi retry sesaat untuk TiDB Serverless
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: USER_SELECT,
      });
    } catch {
      await new Promise((r) => setTimeout(r, 200));
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: USER_SELECT,
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Akun pengguna tidak ditemukan. Silakan login kembali.',
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.',
      });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda belum diverifikasi. Silakan verifikasi email Anda.',
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      locationId: user.locationId,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesi Anda telah berakhir (Token Expired). Silakan login kembali.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token autentikasi tidak valid.',
      });
    }

    console.error('[AuthMiddleware Unexpected/DB Error]:', error);
    return res.status(503).json({
      success: false,
      message: 'Koneksi ke database sedang sibuk. Silakan coba kembali beberapa saat lagi.',
    });
  }
};
