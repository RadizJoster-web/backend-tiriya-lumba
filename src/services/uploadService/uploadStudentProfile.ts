import { uploadToR2 } from '../../utils/r2Storage';

export interface MulterFilesMap {
  [fieldname: string]: Express.Multer.File[];
}

export const processStudentProfileUpload = async (
  files?: MulterFilesMap | Express.Multer.File[],
) => {
  const map = files as MulterFilesMap | undefined;
  const profilePictureFile =
    map?.profilePicture?.[0] || map?.profilePictures?.[0];
  const profilePictureUrl = profilePictureFile
    ? await uploadToR2(profilePictureFile, 'profiles')
    : null;
  return { profilePictureUrl };
};
