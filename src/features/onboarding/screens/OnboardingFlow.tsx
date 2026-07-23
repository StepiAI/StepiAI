import { PersonalizeDayScreen } from './PersonalizeDayScreen';

interface OnboardingFlowProps {
  onDone: () => void;
}

// Alur setelah sign up akun baru.
//
// Dulu urutannya: Personalize -> Location Access -> masuk app. Tapi izin lokasi
// udah diminta OS pas app pertama kali dibuka (lewat useLocationPermission /
// useCurrentLocation), jadi step Location Access di-skip biar user gak dimintain
// lokasi dua kali. LocationAccessScreen-nya masih ada (dipakai sebagai layar
// mandiri), cuma gak lagi jadi bagian flow onboarding ini.
export function OnboardingFlow({ onDone }: OnboardingFlowProps) {
  return <PersonalizeDayScreen onContinue={onDone} />;
}
