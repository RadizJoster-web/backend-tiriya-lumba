import { Request, Response, NextFunction } from 'express';
import { loginService } from '../../services/authService/login';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { accessToken, user } = await loginService(req.body);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil!',
      data: {
        token: accessToken,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
