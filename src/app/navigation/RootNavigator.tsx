import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../../features/scheduler/screens/HomeScreen';
import { NewScheduleModal } from '../../features/scheduler/components/NewScheduleModal';
import { TasksScreen } from '../../features/tasks/screens/TasksScreen';
import { SummaryScreen } from '../../features/summary/screens/SummaryScreen';
import { ProfileScreen } from '../../features/profile/screens/ProfileScreen';
import { ConnectedAppsScreen } from '../../features/profile/screens/ConnectedAppsScreen';
import { AccessibilityScreen } from '../../features/profile/screens/AccessibilityScreen';
import { NotificationsScreen } from '../../features/profile/screens/NotificationsScreen';
import { HelpCenterScreen } from '../../features/profile/screens/HelpCenterScreen';
import { RegisterScreen } from '../../features/auth/screens/RegisterScreen';
import { PersonalizeDayScreen } from '../../features/onboarding/screens/PersonalizeDayScreen';
import { LocationAccessScreen } from '../../features/onboarding/screens/LocationAccessScreen';
import { CalendarScreen } from '../../features/scheduler/screens/CalendarScreen';
import { AdjustScheduleScreen } from '../../features/scheduler/screens/AdjustScheduleScreen';
import { ChatScreen } from '../../features/chat/screens/ChatScreen';
import { useAuthSession } from '../../features/auth/hooks/useAuthSession';
import { TabBar } from './TabBar';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// screen yg punya header sendiri / full-screen, tab bar-nya disembunyiin
const FULL_SCREEN_ROUTES: (keyof MainTabParamList)[] = [
  'Chat',
  'ConnectedApps',
  'Accessibility',
  'Notifications',
  'HelpCenter',
  'AdjustSchedule',
];

function MainTabs() {
  const [addingSchedule, setAddingSchedule] = useState(false);

  const renderTabBar = (props: BottomTabBarProps) => {
    const activeRoute = props.state.routes[props.state.index]?.name as keyof MainTabParamList;
    if (FULL_SCREEN_ROUTES.includes(activeRoute)) return null;
    return <TabBar {...props} onAddPress={() => setAddingSchedule(true)} />;
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={renderTabBar}
        // default-nya "firstRoute", jadi back selalu lompat ke Home.
        // "history" bikin back balik ke screen yg terakhir dibuka.
        backBehavior="history"
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Tasks" component={TasksScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />

        <Tab.Screen name="ConnectedApps" component={ConnectedAppsScreen} />
        <Tab.Screen name="Accessibility" component={AccessibilityScreen} />
        <Tab.Screen name="Notifications" component={NotificationsScreen} />
        <Tab.Screen name="HelpCenter" component={HelpCenterScreen} />

        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="AdjustSchedule" component={AdjustScheduleScreen} />
        <Tab.Screen name="Summary" component={SummaryScreen} />
        <Tab.Screen name="Personalize" component={PersonalizeDayScreen} />
        <Tab.Screen name="Location" component={LocationAccessScreen} />
      </Tab.Navigator>

      <NewScheduleModal
        visible={addingSchedule}
        onClose={() => setAddingSchedule(false)}
      />
    </>
  );
}

export function RootNavigator() {
  const { session, loading } = useAuthSession();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return <NavigationContainer>{session ? <MainTabs /> : <RegisterScreen />}</NavigationContainer>;
}
