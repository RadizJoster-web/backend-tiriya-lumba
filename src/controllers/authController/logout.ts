import { Request, Response, NextFunction } from 'express';

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Opsi cookie wajib sama/presisi dengan opsi saat cookie di-set di browser
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as
        | 'none'
        | 'lax',
    };

    // 1. Ambil seluruh nama cookie yang terdeteksi di request (cookies & signedCookies)
    const activeCookies = [
      ...Object.keys(req.cookies || {}),
      ...Object.keys(req.signedCookies || {}),
    ];

    // 2. Daftar cookie autentikasi bawaan (sebagai cadangan)
    const defaultAuthCookies = [
      'token',
      'accessToken',
      'refreshToken',
      'sessionId',
    ];

    // 3. Gabungkan dan hapus seluruh cookie secara unik
    const allCookiesToClear = Array.from(
      new Set([...activeCookies, ...defaultAuthCookies]),
    );

    allCookiesToClear.forEach((cookieName) => {
      res.clearCookie(cookieName, cookieOptions);
    });

    return res.status(200).json({
      success: true,
      message: 'Logout berhasil. Seluruh cookie dan sesi telah dibersihkan.',
    });
  } catch (error) {
    next(error);
  }
};
