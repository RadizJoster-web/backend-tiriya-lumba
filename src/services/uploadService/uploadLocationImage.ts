import { uploadToR2 } from '../../utils/r2Storage';

export interface MulterFilesMap {
  [fieldname: string]: Express.Multer.File[];
}

export const processLocationImageUpload = async (
  files?: MulterFilesMap | Express.Multer.File[],
) => {
  const map = files as MulterFilesMap | undefined;
  const imageFile = map?.image?.[0] || map?.locationImage?.[0];
  const imageUrl = imageFile
    ? await uploadToR2(imageFile, 'locations')
    : null;
  return { imageUrl };
};
