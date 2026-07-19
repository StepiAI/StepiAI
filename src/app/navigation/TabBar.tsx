import { ComponentType } from 'react';
import { Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { FAB_LIFT, FAB_SIZE, TAB_BAR_HEIGHT } from './tabBarLayout';
import { buildTabBarPath, TAB_BAR_NOTCH_HALF_SPAN } from './tabBarPath';
import {
  ChatBubbleIcon,
  HomeIcon,
  ListIcon,
  PersonIcon,
  PlusIcon,
} from '../../shared/components/Icons';
import { textStyle } from '../../shared/theme/typography';
import type { MainTabParamList } from './types';

const ACTIVE_COLOR = '#111114';
const INACTIVE_COLOR = '#A0A0A8';

const BAR_HEIGHT = TAB_BAR_HEIGHT;

interface TabItem {
  name: keyof MainTabParamList;
  label: string;
  Icon: ComponentType<{ color?: string }>;
}

const LEFT_TABS: TabItem[] = [
  { name: 'Home', label: 'Home', Icon: HomeIcon },
  { name: 'Tasks', label: 'Study Plan', Icon: ListIcon },
];

const RIGHT_TABS: TabItem[] = [
  { name: 'Chat', label: 'Chatbot', Icon: ChatBubbleIcon },
  { name: 'Settings', label: 'Profil', Icon: PersonIcon },
];

interface TabButtonProps {
  item: TabItem;
  focused: boolean;
  onPress: () => void;
}

function TabButton({ item, focused, onPress }: TabButtonProps) {
  const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={item.label}
      className="flex-1 items-center justify-center gap-[3px]"
    >
      <item.Icon color={color} />
      <Text
        className="text-[11px]"
        style={[textStyle(focused ? 'semibold' : 'regular'), { color }]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

interface TabBarProps extends BottomTabBarProps {
  onAddPress?: () => void;
}

export function TabBar({ state, navigation, onAddPress }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const activeRoute = state.routes[state.index]?.name;

  const barHeight = BAR_HEIGHT + insets.bottom;

  const press = (name: keyof MainTabParamList) => () => {
    const route = state.routes.find(candidate => candidate.name === name);
    if (!route) return;

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (activeRoute !== name && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const renderTabs = (items: TabItem[]) =>
    items.map(item => (
      <TabButton
        key={item.name}
        item={item}
        focused={activeRoute === item.name}
        onPress={press(item.name)}
      />
    ));

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: BAR_HEIGHT + FAB_LIFT + insets.bottom,
      }}
    >
      <Svg
        width={width}
        height={barHeight}
        style={{ position: 'absolute', bottom: 0, left: 0 }}
      >
        <Path d={buildTabBarPath({ width, height: barHeight })} fill="#FFFFFF" />
      </Svg>

      <View
        className="absolute bottom-0 left-0 right-0 flex-row"
        style={{ height: barHeight, paddingBottom: insets.bottom }}
      >
        {renderTabs(LEFT_TABS)}

        <View style={{ width: TAB_BAR_NOTCH_HALF_SPAN * 2 }} />

        {renderTabs(RIGHT_TABS)}
      </View>

      <TouchableOpacity
        onPress={onAddPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Add"
        className="absolute self-center items-center justify-center rounded-full bg-light-accent"
        style={{
          width: FAB_SIZE,
          height: FAB_SIZE,
          top: 0,
          shadowColor: '#2E7BE0',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <PlusIcon />
      </TouchableOpacity>
    </View>
  );
}
