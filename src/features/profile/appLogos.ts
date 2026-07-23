import type { ImageSourcePropType } from 'react-native';

/**
 * Logo tiap connected app dikumpulin di sini, jadi kalau filenya ganti cukup
 * ubah satu tempat. Metro nge-resolve require() pas bundling, jadi selama
 * filenya belum ada biarin null dulu — SettingsRow otomatis fallback ke icon
 * vektor. Kalau PNG-nya udah ditaruh di src/assets/images, tinggal uncomment.
 */
export const appLogos: Record<string, ImageSourcePropType | undefined> = {
  googleCalendar: require('../../assets/images/googleCalendar.webp'),
  outlookCalendar: require('../../assets/images/outlook.png'),
  location: require('../../assets/images/googleMaps.webp'),
  weather: require('../../assets/images/weather.png'),
};
