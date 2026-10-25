import { Request, Response, NextFunction } from 'express';

export const uploadStudentPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    const paymentFile =
      files?.paymentProof?.[0] || files?.profilePicture?.[0];
    const paymentProofUrl = paymentFile ? paymentFile.path : null;

    return res.status(200).json({
      success: true,
      message: 'Upload bukti pembayaran berhasil.',
      data: {
        paymentProofUrl,
        profilePictureUrl: paymentProofUrl, // kompatibilitas balik
      },
    });
  } catch (err) {
    next(err);
  }
};
