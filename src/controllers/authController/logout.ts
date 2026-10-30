import { Request, Response, NextFunction } from 'express';
import { logoutService } from '../../services/authService/logout';

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await logoutService();

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Logout berhasil.',
    });
  } catch (error) {
    next(error);
  }
};
