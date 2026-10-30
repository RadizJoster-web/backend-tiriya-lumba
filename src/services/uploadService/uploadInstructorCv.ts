import { uploadToR2 } from '../../utils/r2Storage';

export interface MulterFilesMap {
  [fieldname: string]: Express.Multer.File[];
}

export const processInstructorCvUpload = async (
  files?: MulterFilesMap | Express.Multer.File[],
) => {
  const map = files as MulterFilesMap | undefined;
  const cvFile = map?.cv?.[0];
  const cvUrl = cvFile ? await uploadToR2(cvFile, 'cvs') : null;
  return { cvUrl };
};
