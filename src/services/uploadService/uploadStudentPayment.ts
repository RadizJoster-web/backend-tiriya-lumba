import { uploadToR2 } from '../../utils/r2Storage';

export interface MulterFilesMap {
  [fieldname: string]: Express.Multer.File[];
}

export const processStudentPaymentUpload = async (
  files?: MulterFilesMap | Express.Multer.File[],
) => {
  const map = files as MulterFilesMap | undefined;
  const paymentFile = map?.paymentProof?.[0] || map?.profilePicture?.[0];
  const paymentProofUrl = paymentFile
    ? await uploadToR2(paymentFile, 'payments')
    : null;
  return {
    paymentProofUrl,
    profilePictureUrl: paymentProofUrl,
  };
};
