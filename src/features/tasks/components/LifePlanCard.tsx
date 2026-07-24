import { useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MoreIcon } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import type { LifePlanRecord } from '../../../services/lifePlan/client';
import { PROGRESS_TRACK_COLOR } from '../theme';
import { formatDateLabel } from '../utils/dateTime';
import {
  countCompletedSessions,
  countLifePlanSessions,
  getLifePlanDurationDays,
  isLifePlanCompleted,
} from '../utils/lifePlanMapping';
import { CardMenuAnchor, LifePlanCardMenu } from './LifePlanCardMenu';

interface LifePlanCardProps {
  plan: LifePlanRecord;
  archived?: boolean;
  onPress: () => void;
  onArchiveToggle?: () => void;
  onDelete?: () => void;
}

export function LifePlanCard({
  plan,
  archived = false,
  onPress,
  onArchiveToggle,
  onDelete,
}: LifePlanCardProps) {
  const totalSessions = countLifePlanSessions(plan);
  const durationDays = getLifePlanDurationDays(plan);
  const completedSessions = countCompletedSessions(plan);
  const progressRatio = totalSessions > 0 ? completedSessions / totalSessions : 0;
  const completed = isLifePlanCompleted(plan);

  const triggerRef = useRef<View>(null);
  const [menuAnchor, setMenuAnchor] = useState<CardMenuAnchor | null>(null);

  const hasMenu = Boolean(onArchiveToggle || onDelete);

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setMenuAnchor({ x: x + width, y: y + height });
    });
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="rounded-[16px] bg-white p-[18px]">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 flex-row items-center pr-[10px]">
          <Text
            className="shrink text-[16px] text-light-inkStrong"
            style={textStyle('bold')}
            numberOfLines={1}
          >
            {plan.title}
          </Text>
          {completed ? (
            <View className="ml-[8px] rounded-full bg-light-accentSoft px-[10px] py-[3px]">
              <Text className="text-[11px] text-light-accent" style={textStyle('semibold')}>
                Completed
              </Text>
            </View>
          ) : null}
        </View>

        {hasMenu ? (
          <TouchableOpacity
            ref={triggerRef}
            onPress={openMenu}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="pl-[4px]"
          >
            <MoreIcon />
          </TouchableOpacity>
        ) : (
          <MoreIcon />
        )}
      </View>

      <Text className="mt-[4px] text-[13px] text-light-muted" style={textStyle('regular')}>
        {formatDateLabel(new Date(plan.startDate))} - {formatDateLabel(new Date(plan.endDate))}
      </Text>

      <View className="mt-[16px] flex-row items-center justify-between">
        <Text className="text-[13px] text-light-muted" style={textStyle('medium')}>
          {durationDays}d Sessions
        </Text>
        <Text className="text-[13px] text-light-muted" style={textStyle('medium')}>
          {completedSessions} / {totalSessions}
        </Text>
      </View>

      {/* bar terisi biru sesuai progres + titik penanda di ujungnya */}
      <View
        className="mt-[10px] h-[6px] justify-center rounded-full"
        style={{ backgroundColor: PROGRESS_TRACK_COLOR }}
      >
        <View
          className="h-[6px] flex-row items-center justify-end rounded-full bg-light-accent"
          style={{ width: `${Math.max(progressRatio * 100, progressRatio > 0 ? 4 : 0)}%` }}
        >
          {progressRatio > 0 ? (
            <View className="mr-[-1px] h-[10px] w-[10px] rounded-full border-[2px] border-white bg-light-accent" />
          ) : null}
        </View>
      </View>

      <LifePlanCardMenu
        visible={menuAnchor !== null}
        anchor={menuAnchor}
        archived={archived}
        onClose={() => setMenuAnchor(null)}
        onArchiveToggle={() => onArchiveToggle?.()}
        onDelete={() => onDelete?.()}
      />
    </TouchableOpacity>
  );
}
