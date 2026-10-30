import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import path from 'path';
import { AppError } from './appError';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');

let s3ClientInstance: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new AppError(500, 'Konfigurasi Cloudflare R2 belum lengkap di environment variable.');
    }
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3ClientInstance;
}

export function normalizeR2Url(url?: string | null): string | null {
  if (!url) return null;
  if (url.includes('.r2.cloudflarestorage.com/')) {
    const fileKey = url.split('.r2.cloudflarestorage.com/')[1];
    return `/api/files/${fileKey}`;
  }
  return url;
}

export async function uploadToR2(
  file: Express.Multer.File,
  folder: 'profiles' | 'payments' | 'cvs',
): Promise<string> {
  if (!file || !file.buffer) {
    throw new AppError(400, 'Berkas tidak ditemukan atau isi berkas kosong.');
  }

  const client = getS3Client();
  const ext = path.extname(file.originalname).toLowerCase();
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const fileKey = `${folder}/${file.fieldname}-${uniqueSuffix}${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  if (!publicUrl || publicUrl.includes('r2.cloudflarestorage.com')) {
    return `/api/files/${fileKey}`;
  }

  return `${publicUrl}/${fileKey}`;
}

export async function getFileFromR2(fileKey: string): Promise<{
  stream: Readable;
  contentType?: string;
  contentLength?: number;
}> {
  const client = getS3Client();
  const res = await client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    }),
  );

  return {
    stream: res.Body as Readable,
    contentType: res.ContentType,
    contentLength: res.ContentLength,
  };
}
