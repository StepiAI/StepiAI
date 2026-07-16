import { PropsWithChildren } from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps extends PropsWithChildren {
  style?: ViewStyle;
  className?: string;
}

export function Card({ children, style, className }: CardProps) {
  return (
    <View style={style} className={`rounded-xl bg-surface p-md ${className ?? ''}`}>
      {children}
    </View>
  );
}
