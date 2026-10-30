import { Request, Response } from 'express';
import { getFileFromR2 } from '../../utils/r2Storage';

export const getFile = async (req: Request, res: Response) => {
  try {
    const params = req.params as Record<string, string | undefined>;
    const rawKey =
      params.path ||
      (params.folder && params.filename ? `${params.folder}/${params.filename}` : '');
    const fileKey = decodeURIComponent(rawKey || '').replace(/^\/+/, '');

    if (!fileKey) {
      return res.status(400).json({ success: false, message: 'Nama berkas tidak valid.' });
    }

    const { stream, contentType, contentLength } = await getFileFromR2(fileKey);

    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');

    stream.on('error', (err) => {
      console.error('[Stream Error]:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Gagal membaca berkas.' });
      }
    });

    stream.pipe(res);
  } catch (err: any) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ success: false, message: 'Berkas tidak ditemukan.' });
    }
    console.error('[GetFile Error]:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil berkas dari storage.' });
  }
};
