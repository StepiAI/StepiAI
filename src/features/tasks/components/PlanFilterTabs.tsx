import { Text, TouchableOpacity, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';

export type PlanFilter = 'all' | 'archived';

interface PlanFilterTabsProps {
  value: PlanFilter;
  onChange: (value: PlanFilter) => void;
}

const TABS: { value: PlanFilter; label: string }[] = [
  { value: 'all', label: 'All Plans' },
  { value: 'archived', label: 'Archived' },
];

export function PlanFilterTabs({ value, onChange }: PlanFilterTabsProps) {
  return (
    <View className="flex-row rounded-full bg-light-fill p-[4px]">
      {TABS.map(tab => {
        const active = tab.value === value;

        return (
          <TouchableOpacity
            key={tab.value}
            onPress={() => onChange(tab.value)}
            activeOpacity={0.7}
            className={`flex-1 items-center rounded-full py-[10px] ${active ? 'bg-white' : ''}`}
          >
            <Text
              className={active ? 'text-[14px] text-light-inkStrong' : 'text-[14px] text-light-faint'}
              style={textStyle(active ? 'semibold' : 'medium')}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
