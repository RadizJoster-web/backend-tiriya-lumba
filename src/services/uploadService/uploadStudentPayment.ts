export interface MulterFilesMap {
  [fieldname: string]: Express.Multer.File[];
}

export const processStudentPaymentUpload = (
  files?: MulterFilesMap | Express.Multer.File[],
) => {
  const map = files as MulterFilesMap | undefined;
  const paymentFile = map?.paymentProof?.[0] || map?.profilePicture?.[0];
  const paymentProofUrl = paymentFile ? paymentFile.path : null;
  return {
    paymentProofUrl,
    profilePictureUrl: paymentProofUrl,
  };
};
