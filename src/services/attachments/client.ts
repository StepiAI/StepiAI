import { supabase } from '../supabase/client';

const BUCKET = 'attachments';

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365;

export interface PickedFile {
  uri: string;
  name: string;
  type: string | null;
  size: number | null;
}

export interface UploadedAttachment {
  path: string;
  name: string;
  size: number | null;
  signedUrl: string;
}

function sanitize(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_')
    .slice(-80);
}

function uniquePrefix() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// presigned url
export async function uploadAttachment(
  file: PickedFile,
): Promise<UploadedAttachment> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Kamu harus login dulu buat upload lampiran.');
  }

  const response = await fetch(file.uri);
  if (!response.ok) {
    throw new Error(`Gagal baca file (HTTP ${response.status}).`);
  }
  const body = await response.arrayBuffer();

  const path = `${userId}/${uniquePrefix()}-${sanitize(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, {
      contentType: file.type ?? 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload gagal: ${uploadError.message}`);
  }

  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (signError || !data?.signedUrl) {
    throw new Error(
      `File keupload tapi link-nya gagal dibuat: ${signError?.message ?? 'unknown'}`,
    );
  }

  return {
    path,
    name: file.name,
    size: file.size,
    signedUrl: data.signedUrl,
  };
}

export async function removeAttachment(path: string) {
  await supabase.storage.from(BUCKET).remove([path]);
}
