import { View } from 'react-native';
import { PROGRESS_TRACK_COLOR, LIFE_PLAN_GRADIENT } from '../theme';

interface ProgressStepsProps {
  total: number;
  current: number;
}

export function ProgressSteps({ total, current }: ProgressStepsProps) {
  return (
    <View className="mt-[18px] flex-row gap-[6px] px-[20px]">
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          className="h-[3px] flex-1 overflow-hidden rounded-full"
          style={{ backgroundColor: PROGRESS_TRACK_COLOR }}
        >
          {index < current ? (
            <View
              className="h-full w-full rounded-full"
              style={{ backgroundColor: '#2E7BE0', experimental_backgroundImage: LIFE_PLAN_GRADIENT }}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}
