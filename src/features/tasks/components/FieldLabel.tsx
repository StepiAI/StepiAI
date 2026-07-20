import { Text } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';

export function FieldLabel({ children }: { children: string }) {
  return (
    <Text
      className="mb-[10px] ml-[4px] text-[11px] tracking-[1.1px] text-light-faint"
      style={textStyle('medium')}
    >
      {children}
    </Text>
  );
}
