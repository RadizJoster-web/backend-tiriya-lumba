import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'POOL_MANAGER' | 'INSTRUCTOR' | 'STUDENT' | 'USER';
  locationId?: string | null;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let headerToken: string | undefined;
    let cookieToken: string | undefined;

    // 1. Ekstrak token dari Authorization Header (Bearer) dan Cookie
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      headerToken = req.headers.authorization.split(' ')[1];
    }
    if (req.cookies && req.cookies.access_token) {
      cookieToken = req.cookies.access_token;
    }

    const candidates = [headerToken, cookieToken].filter(Boolean) as string[];

    if (candidates.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token autentikasi tidak ditemukan.',
      });
    }

    // 2. Dekode & Verifikasi JWT (coba kandidat token)
    let decoded: JwtPayload | null = null;
    let lastError: any = null;

    for (const cand of candidates) {
      try {
        decoded = jwt.verify(
          cand,
          process.env.JWT_SECRET || 'default_secret',
        ) as JwtPayload;
        if (decoded) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!decoded) {
      if (lastError?.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message:
            'Sesi Anda telah berakhir (Token Expired). Silakan login kembali.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Token autentikasi tidak valid.',
      });
    }

    // 3. Query efisien ke DB dengan Select
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        locationId: true,
      },
    });

    if (!user || !user.isActive || !user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Sesi Anda tidak valid atau akun telah nonaktif.',
      });
    }

    // 4. Set ke req.user tanpa error TS
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
        message:
          'Sesi Anda telah berakhir (Token Expired). Silakan login kembali.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token autentikasi tidak valid.',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses terlarang. Anda tidak memiliki izin untuk tindakan ini.',
      });
    }
    next();
  };
};
