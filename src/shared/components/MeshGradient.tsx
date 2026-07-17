import { PropsWithChildren } from 'react';
import { View } from 'react-native';

interface MeshGradientProps extends PropsWithChildren {
  className?: string;
}

export function MeshGradient({ children, className }: MeshGradientProps) {
  return (
    <View
      className={`flex-1 bg-[#A98CF2] ${className ?? ''}`}
      style={{ experimental_backgroundImage: meshLayers }}
    >
      {children}
    </View>
  );
}

const meshLayers = [
  'radial-gradient(70% 45% at 100% 100%, rgba(255, 174, 232, 0.55) 0%, rgba(255, 174, 232, 0) 60%)',
  'radial-gradient(70% 45% at 0% 96%, rgba(126, 119, 255, 0.45) 0%, rgba(126, 119, 255, 0) 60%)',
  'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 18%, #EAF6FA 32%, #C9E9F5 44%, #9FCFEF 56%, #8DA8EA 68%, #8C7FE0 80%, #B285D9 90%, #E3A0D6 100%)',
].join(', ');
