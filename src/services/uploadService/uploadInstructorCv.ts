export interface MulterFilesMap {
  [fieldname: string]: Express.Multer.File[];
}

export const processInstructorCvUpload = (
  files?: MulterFilesMap | Express.Multer.File[],
) => {
  const map = files as MulterFilesMap | undefined;
  const cvFile = map?.cv?.[0];
  const cvUrl = cvFile ? cvFile.path : null;
  return { cvUrl };
};
