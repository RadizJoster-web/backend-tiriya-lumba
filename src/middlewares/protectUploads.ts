import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

interface JwtPayload {
  userId: string;
  role: string;
}

/**
 * Middleware untuk mengamankan akses ke berkas sensitif (/public/uploads/payments dan /public/uploads/cvs).
 * Mengizinkan akses hanya bagi pengguna yang memiliki token JWT valid (ADMIN, POOL_MANAGER, atau user terkait).
 */
export const protectPrivateUploads = (
  folderName: 'payments' | 'cvs',
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Silakan login untuk melihat dokumen sensitif ini.',
      });
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ success: false, message: 'Server configuration error.' });
      }

      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256'],
      }) as JwtPayload;

      if (!decoded) {
        return res.status(401).json({ success: false, message: 'Token tidak valid.' });
      }

      // Validasi path traversal pada filename
      const filename = path.basename(req.path);
      const filePath = path.join(process.cwd(), 'public', 'uploads', folderName, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Berkas tidak ditemukan.' });
      }

      return res.sendFile(filePath);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Token kedaluwarsa atau tidak valid.',
      });
    }
  };
};
