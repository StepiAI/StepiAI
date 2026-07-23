import { Image } from 'react-native';

interface LifePlanLogoProps {
  size?: number;
}

export function LifePlanLogo({ size = 130 }: LifePlanLogoProps) {
  return (
    <Image
      source={require('../../../assets/images/life-plan-logo.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
