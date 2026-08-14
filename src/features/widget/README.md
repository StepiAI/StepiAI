# Widget home screen

Widget agenda buat Android. Nampilin acara terdekat user tanpa perlu buka app.

## Cara kerjanya

Widget itu proses OS, bukan app kita — komponen React Native di `src/features/*`
gak bisa dipakai di sana. Android gambar widget lewat `RemoteViews`.

Alurnya:

```
Google Calendar → backend → apiClient
                               │
                               ▼
                    buildWidgetSnapshot()      ← murni, ada testnya
                               │
                               ▼
                    AsyncStorage (cache)
                               │
                               ▼
                    AgendaWidget → RemoteViews
```

Ada dua jalur yang men-trigger gambar ulang:

1. **App lagi kebuka** — `useGoogleCalendarEvents` manggil `syncWidgetFromApp()`
   tiap kali data baru masuk. Widget langsung nyusul, gak nunggu Android.
2. **App ketutup** — Android manggil headless JS task (`widgetTaskHandler`)
   tiap `updatePeriodMillis`. Task ini jalan di konteks JS, jadi session
   Supabase dan `apiClient` bisa dipakai kayak biasa.

Snapshot terakhir selalu di-cache. Widget gambar dari cache **dulu**, baru
fetch — biar gak nge-blank pas jaringan lemot atau pas offline.

## File

| File | Isinya |
| --- | --- |
| `types.ts` | Bentuk data yang dibaca widget. Plain JSON, gak ada `Date`. |
| `constants.ts` | Nama widget + rentang hari yang diambil. |
| `theme.ts` | Warna widget, light sama dark. |
| `utils/snapshot.ts` | Ubah event Google jadi snapshot. Murni, gampang dites. |
| `storage.ts` | Cache snapshot di AsyncStorage. |
| `sync.ts` | Fetch, simpen, suruh widget gambar ulang. |
| `widgetTaskHandler.tsx` | Titik masuk headless task dari Android. |
| `components/AgendaWidget.tsx` | Layout widget (light + dark). |

## Native (Android)

Ini disetel manual — repo ini bare RN, jadi config plugin Expo-nya gak jalan.
Kalau salah satu ilang, widget gak error; dia cuma **gak muncul** di picker atau
diem gak keupdate.

- `android/app/src/main/java/com/stepiai/widget/StepiAgenda.java`
  Nama class-nya **harus** sama dengan `WIDGET_NAME` di `constants.ts`.
- `android/app/src/main/res/xml/widgetprovider_stepiagenda.xml`
  Ukuran, resize, sama interval update.
- `android/app/src/main/res/layout/widget_stepiagenda_preview.xml`
  Yang keliatan di widget picker. Ditiru manual dari `AgendaWidget.tsx` —
  kalau layout aslinya berubah banyak, samain juga yang di sini.
- `AndroidManifest.xml` — receiver `.widget.StepiAgenda` + service
  `RNWidgetCollectionService`.
- `index.js` — `registerWidgetTaskHandler()` dipanggil di top level, soalnya
  Android bisa jalanin task ini pas app-nya sama sekali gak idup.

Habis ubah file native, **rebuild** (`npm run android`). Reload Metro doang gak
ngefek.

## Yang perlu diinget

- `updatePeriodMillis` minimalnya 30 menit — dipaksa Android, gak bisa dikecilin.
  Nilai yang lebih kecil bakal dibuletin naik.
- Android gak jamin update tepat waktu. Pas HP lagi Doze, update bisa ditunda
  sampe layarnya nyala. Ini normal buat semua widget, bukan bug kita.
- iOS belum ada. Layer datanya (`types.ts`, `snapshot.ts`) udah sengaja dibikin
  gak platform-specific, jadi widget WidgetKit nanti tinggal baca snapshot yang
  sama lewat App Group. Yang perlu ditulis ulang cuma UI-nya.
