import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'POOL_MANAGER' | 'INSTRUCTOR' | 'STUDENT';
  locationId?: string | null;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined;

    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token autentikasi tidak ditemukan.',
      });
    }

    // 2. Dekode & Verifikasi JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret',
    ) as JwtPayload;

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

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          'Hak akses ditolak. Anda tidak memiliki izin untuk tindakan ini.',
      });
    }

    next();
  };
};
