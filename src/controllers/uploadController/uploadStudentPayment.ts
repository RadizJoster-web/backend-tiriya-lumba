import { Request, Response, NextFunction } from 'express';
import { processStudentPaymentUpload } from '../../services/uploadService/uploadStudentPayment';

export const uploadStudentPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = processStudentPaymentUpload(req.files as any);
    return res.status(200).json({
      success: true,
      message: 'Upload bukti pembayaran berhasil.',
      data,
    });
  } catch (err) {
    next(err);
  }
};
