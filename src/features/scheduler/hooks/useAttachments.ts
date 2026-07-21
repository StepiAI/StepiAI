import { useCallback, useState } from 'react';
import {
  errorCodes,
  isErrorWithCode,
  pick,
} from '@react-native-documents/picker';
import {
  PickedFile,
  UploadedAttachment,
  removeAttachment,
  uploadAttachment,
} from '../../../services/attachments/client';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function useAttachments() {
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(async () => {
    setError(null);

    let picked;
    try {
      picked = await pick({ allowMultiSelection: true });
    } catch (err) {
      // user nutup picker tu bkn error, jgn diteriakkin
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Gagal buka file picker.');
      return;
    }

    const tooBig = picked.filter(
      f => f.size !== null && f.size > MAX_FILE_BYTES,
    );
    if (tooBig.length) {
      setError(
        `${tooBig[0].name ?? 'File'} kegedean — maksimal 10 MB per file.`,
      );
    }

    const accepted: PickedFile[] = picked
      .filter(f => f.size === null || f.size <= MAX_FILE_BYTES)
      .map(f => ({
        uri: f.uri,
        name: f.name ?? 'lampiran',
        type: f.type,
        size: f.size,
      }));

    setFiles(prev => [...prev, ...accepted]);
  }, []);

  const remove = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => {
    setFiles([]);
    setError(null);
    setUploading(false);
  }, []);

  const uploadAll = useCallback(async (): Promise<UploadedAttachment[] | null> => {
    if (files.length === 0) {
      return [];
    }

    setUploading(true);
    setError(null);

    const done: UploadedAttachment[] = [];
    try {
      for (const file of files) {
        done.push(await uploadAttachment(file));
      }
      return done;
    } catch (err) {
      await Promise.all(done.map(a => removeAttachment(a.path).catch(() => {})));
      setError(err instanceof Error ? err.message : 'Upload lampiran gagal.');
      return null;
    } finally {
      setUploading(false);
    }
  }, [files]);

  return { files, add, remove, clear, uploadAll, uploading, error };
}
