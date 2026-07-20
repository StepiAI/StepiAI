import { Image } from 'react-native';

interface StudyPlanLogoProps {
  size?: number;
}

export function StudyPlanLogo({ size = 130 }: StudyPlanLogoProps) {
  return (
    <Image
      source={require('../../../assets/images/study-plan-logo.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
