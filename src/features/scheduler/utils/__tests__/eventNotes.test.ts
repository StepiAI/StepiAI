import { parseEventNotes } from '../eventNotes';

const URL_ONE = 'https://example.supabase.co/storage/v1/object/sign/b3.png?token=abc';
const URL_TWO = 'https://example.supabase.co/storage/v1/object/sign/notes.pdf?token=xyz';

describe('parseEventNotes', () => {
  it('returns empty result for missing input', () => {
    expect(parseEventNotes(undefined)).toEqual({ text: '', attachments: [] });
    expect(parseEventNotes(null)).toEqual({ text: '', attachments: [] });
  });

  it('treats plain description without a marker as notes text', () => {
    expect(parseEventNotes('just some notes')).toEqual({
      text: 'just some notes',
      attachments: [],
    });
  });

  it('splits notes text from attachments and flags images', () => {
    const raw = `Ini notes\n\n📎 Lampiran:\n• b3.png\n  ${URL_ONE}\n• notes.pdf\n  ${URL_TWO}`;

    expect(parseEventNotes(raw)).toEqual({
      text: 'Ini notes',
      attachments: [
        { name: 'b3.png', url: URL_ONE, isImage: true },
        { name: 'notes.pdf', url: URL_TWO, isImage: false },
      ],
    });
  });

  it('parses attachments even when there is no notes text', () => {
    const raw = `📎 Lampiran:\n• b3.png\n  ${URL_ONE}`;
    const parsed = parseEventNotes(raw);

    expect(parsed.text).toBe('');
    expect(parsed.attachments).toEqual([
      { name: 'b3.png', url: URL_ONE, isImage: true },
    ]);
  });

  it('detects images from the url when the name has no extension', () => {
    const raw = `📎 Lampiran:\n• photo\n  ${URL_ONE}`;
    expect(parseEventNotes(raw).attachments[0].isImage).toBe(true);
  });
});
