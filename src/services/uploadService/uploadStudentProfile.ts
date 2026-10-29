export interface MulterFilesMap {
  [fieldname: string]: Express.Multer.File[];
}

export const processStudentProfileUpload = (
  files?: MulterFilesMap | Express.Multer.File[],
) => {
  const map = files as MulterFilesMap | undefined;
  const profilePictureFile =
    map?.profilePicture?.[0] || map?.profilePictures?.[0];
  const profilePictureUrl = profilePictureFile
    ? profilePictureFile.path.replace(/\\/g, '/')
    : null;
  return { profilePictureUrl };
};
