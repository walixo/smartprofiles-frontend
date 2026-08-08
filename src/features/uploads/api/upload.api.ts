import { apiGet, apiPost } from '@/lib/api-client';

export type UploadKind = 'avatar' | 'cover' | 'work';

export interface UploadConfig {
  enabled: boolean;
  maxBytes: number;
}

export interface UploadSignature {
  uploadUrl: string;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
  maxBytes: number;
}

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export function fetchUploadConfig(): Promise<UploadConfig> {
  return apiGet<UploadConfig>('/uploads/config');
}

function requestSignature(kind: UploadKind): Promise<UploadSignature> {
  return apiPost<UploadSignature>('/uploads/signature', { kind });
}

/**
 * Uploads straight to Cloudinary using a signature minted by our API.
 *
 * The file never touches our server: it would otherwise have to be buffered
 * through a serverless function with a hard body-size limit. The tradeoff is
 * that this call bypasses `apiClient`, so it gets no auth header (correct —
 * Cloudinary authenticates the signature, not the user) and no interceptor,
 * meaning failures have to be translated here.
 *
 * Uses XHR rather than fetch because upload progress has no fetch equivalent.
 */
export async function uploadImage(
  kind: UploadKind,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadedImage> {
  const signature = await requestSignature(kind);

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signature.apiKey);
  // These must match the signed set exactly — any extra or altered signed
  // parameter invalidates the signature and Cloudinary rejects the upload.
  form.append('timestamp', String(signature.timestamp));
  form.append('signature', signature.signature);
  form.append('folder', signature.folder);
  form.append('allowed_formats', signature.allowedFormats);
  form.append('overwrite', 'false');
  form.append('unique_filename', 'true');

  return new Promise<UploadedImage>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', signature.uploadUrl);

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener('load', () => {
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(request.responseText) as Record<string, unknown>;
      } catch {
        reject(new Error('Cloudinary returned an unreadable response.'));
        return;
      }

      if (request.status < 200 || request.status >= 300) {
        const detail = (payload.error as { message?: string } | undefined)?.message;
        reject(new Error(detail ?? `Upload failed (${request.status}).`));
        return;
      }

      resolve({
        url: String(payload.secure_url),
        publicId: String(payload.public_id),
        width: Number(payload.width),
        height: Number(payload.height),
        bytes: Number(payload.bytes),
        format: String(payload.format),
      });
    });

    request.addEventListener('error', () => reject(new Error('Could not reach the image host.')));
    request.addEventListener('abort', () => reject(new Error('Upload cancelled.')));

    request.send(form);
  });
}
