const ATTACHMENT_MARKER = '📎 Lampiran:';
const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|bmp|heic|heif)$/i;

export interface EventAttachment {
  name: string;
  url: string;
  isImage: boolean;
}

export interface ParsedEventNotes {
  text: string;
  attachments: EventAttachment[];
}

function looksLikeImage(name: string, url: string) {
  return IMAGE_EXTENSIONS.test(name) || IMAGE_EXTENSIONS.test(url.split('?')[0]);
}

export function parseEventNotes(raw?: string | null): ParsedEventNotes {
  if (!raw) {
    return { text: '', attachments: [] };
  }

  const markerIndex = raw.indexOf(ATTACHMENT_MARKER);
  if (markerIndex === -1) {
    return { text: raw.trim(), attachments: [] };
  }

  const text = raw.slice(0, markerIndex).trim();
  const block = raw.slice(markerIndex + ATTACHMENT_MARKER.length);

  const lines = block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const attachments: EventAttachment[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.startsWith('•')) {
      continue;
    }

    const name = line.replace(/^•\s*/, '').trim();
    const next = lines[index + 1];
    const url = next && !next.startsWith('•') ? next : '';
    if (url) {
      index++;
    }

    if (name && url) {
      attachments.push({ name, url, isImage: looksLikeImage(name, url) });
    }
  }

  return { text, attachments };
}
