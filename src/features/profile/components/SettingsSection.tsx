import { Children, Fragment, PropsWithChildren, isValidElement } from 'react';
import { Text, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';

interface SettingsSectionProps extends PropsWithChildren {
  title?: string;
  caption?: string;
  className?: string;
}

// card putih yg isinya row2, dikasih garis pemisah otomatis biar gak nulis divider manual
export function SettingsSection({
  title,
  caption,
  className,
  children,
}: SettingsSectionProps) {
  const rows = Children.toArray(children).filter(isValidElement);

  return (
    <View className={className}>
      {title ? (
        <Text
          className="mb-[8px] ml-[16px] text-[12px] tracking-[0.6px] text-light-muted"
          style={textStyle('semibold')}
        >
          {title.toUpperCase()}
        </Text>
      ) : null}

      <View className="overflow-hidden rounded-[14px] bg-light-sheet">
        {rows.map((row, index) => (
          <Fragment key={row.key ?? index}>
            {index > 0 ? <View className="ml-[16px] h-[1px] bg-light-rule" /> : null}
            {row}
          </Fragment>
        ))}
      </View>

      {caption ? (
        <Text
          className="mt-[8px] px-[16px] text-[12px] leading-[17px] text-light-muted"
          style={textStyle('regular')}
        >
          {caption}
        </Text>
      ) : null}
    </View>
  );
}
