import { parseAssistantContent } from '../parseAssistantContent';

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

const PROPOSAL = {
  type: 'schedule_proposal',
  summary: 'Dentist appointment',
  description: null,
  location: 'Clinic A',
  startDateTime: '2026-07-24T10:00:00.000Z',
  endDateTime: '2026-07-24T11:00:00.000Z',
};

describe('parseAssistantContent', () => {
  it('baca balasan teks biasa', () => {
    const result = parseAssistantContent(
      JSON.stringify({ type: 'message', content: 'You have three things today.' }),
    );

    expect(result).toEqual({ kind: 'text', text: 'You have three things today.' });
  });

  it('baca usulan jadwal', () => {
    const result = parseAssistantContent(JSON.stringify(PROPOSAL));

    expect(result.kind).toBe('proposal');
    expect(result).toMatchObject({
      proposal: { summary: 'Dentist appointment', location: 'Clinic A' },
    });
  });

  it('lepas pagar markdown yang suka dikasih model', () => {
    const raw = '```json\n' + JSON.stringify({ type: 'message', content: 'Hi' }) + '\n```';

    expect(parseAssistantContent(raw)).toEqual({ kind: 'text', text: 'Hi' });
  });

  it('lepas pagar markdown tanpa label bahasa', () => {
    const raw = '```\n' + JSON.stringify({ type: 'message', content: 'Hi' }) + '\n```';

    expect(parseAssistantContent(raw)).toEqual({ kind: 'text', text: 'Hi' });
  });

  it('tampilin apa adanya kalau model bales prosa, bukan JSON', () => {
    const result = parseAssistantContent('Sure, I moved it to 3pm.');

    expect(result).toEqual({ kind: 'text', text: 'Sure, I moved it to 3pm.' });
  });

  it('jangan bikin kartu kalau usulannya gak ada judul', () => {
    const result = parseAssistantContent(
      JSON.stringify({ ...PROPOSAL, summary: '   ' }),
    );

    expect(result.kind).toBe('text');
  });

  it('jangan bikin kartu kalau tanggalnya gak kebaca', () => {
    const result = parseAssistantContent(
      JSON.stringify({ ...PROPOSAL, startDateTime: 'besok pagi' }),
    );

    expect(result.kind).toBe('text');
  });

  it('jangan bikin kartu kalau waktu selesainya gak ada', () => {
    const result = parseAssistantContent(
      JSON.stringify({ ...PROPOSAL, endDateTime: undefined }),
    );

    expect(result.kind).toBe('text');
  });

  it('balik ke fallback kalau tipenya gak dikenal', () => {
    const result = parseAssistantContent(JSON.stringify({ type: 'something_else' }));

    expect(result.kind).toBe('text');
  });

  it('balik ke fallback kalau balasan teksnya kosong', () => {
    const result = parseAssistantContent(JSON.stringify({ type: 'message', content: '' }));

    expect(result.kind).toBe('text');
    expect(result).toMatchObject({ text: expect.stringContaining('again') });
  });

  it('balik ke fallback kalau contentnya string kosong', () => {
    expect(parseAssistantContent('').kind).toBe('text');
    expect(parseAssistantContent('   ').kind).toBe('text');
  });

  it('rapiin lokasi dan deskripsi yang isinya spasi doang jadi null', () => {
    const result = parseAssistantContent(
      JSON.stringify({ ...PROPOSAL, location: '  ', description: '  ' }),
    );

    expect(result).toMatchObject({
      proposal: { location: null, description: null },
    });
  });

  it('gak pernah throw walau JSON-nya rusak', () => {
    expect(() => parseAssistantContent('{"type": "message"')).not.toThrow();
    expect(parseAssistantContent('{"type": "message"').kind).toBe('text');
  });
});
