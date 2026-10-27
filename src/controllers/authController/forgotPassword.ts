import { Request, Response, NextFunction } from 'express';
import { forgotPasswordService } from '../../services/authService/forgotPassword';

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await forgotPasswordService(req.body);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
