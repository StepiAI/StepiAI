import { interpretPermissionResults } from '../useLocationPermission';

const FINE = 'android.permission.ACCESS_FINE_LOCATION';
const COARSE = 'android.permission.ACCESS_COARSE_LOCATION';

describe('interpretPermissionResults', () => {
  it('dua-duanya dikasih', () => {
    expect(
      interpretPermissionResults({ [FINE]: 'granted', [COARSE]: 'granted' }),
    ).toBe('granted');
  });

  it('lokasi kira-kira doang tetep dianggep berhasil', () => {
    expect(
      interpretPermissionResults({ [FINE]: 'denied', [COARSE]: 'granted' }),
    ).toBe('granted');
  });

  it('ditolak dua-duanya', () => {
    expect(
      interpretPermissionResults({ [FINE]: 'denied', [COARSE]: 'denied' }),
    ).toBe('denied');
  });

  it('satu never_ask_again udah bikin dialognya gak bakal muncul lagi', () => {
    expect(
      interpretPermissionResults({ [FINE]: 'never_ask_again', [COARSE]: 'denied' }),
    ).toBe('blocked');
  });

  it('blocked kalau dua-duanya never_ask_again', () => {
    expect(
      interpretPermissionResults({
        [FINE]: 'never_ask_again',
        [COARSE]: 'never_ask_again',
      }),
    ).toBe('blocked');
  });

  it('granted menang atas never_ask_again — jangan sampe user diusir ke Settings padahal izinnya udah ada', () => {
    expect(
      interpretPermissionResults({
        [FINE]: 'never_ask_again',
        [COARSE]: 'granted',
      }),
    ).toBe('granted');
  });

  it('hasil kosong dianggep ditolak, bukan berhasil', () => {
    expect(interpretPermissionResults({})).toBe('denied');
  });
});
