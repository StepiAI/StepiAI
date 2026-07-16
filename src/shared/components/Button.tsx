import { Pressable, Text } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onPress, variant = 'primary' }: ButtonProps) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      onPress={onPress}
      className={`items-center rounded-lg py-sm px-md ${
        isSecondary ? 'border border-border bg-transparent' : 'bg-primary'
      }`}
    >
      <Text className="text-body font-semibold text-onPrimary">{label}</Text>
    </Pressable>
  );
}
