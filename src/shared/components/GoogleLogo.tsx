import { Image } from 'react-native';

interface GoogleLogoProps {
  size?: number;
}


export function GoogleLogo({ size = 22 }: GoogleLogoProps) {
  return (
    <Image
      source={require('../../assets/images/google-logo.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
