import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../../features/scheduler/screens/HomeScreen';
import { NewScheduleModal } from '../../features/scheduler/components/NewScheduleModal';
import { TasksScreen } from '../../features/tasks/screens/TasksScreen';
import { SummaryScreen } from '../../features/summary/screens/SummaryScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { RegisterScreen } from '../../features/auth/screens/RegisterScreen';
import { PersonalizeDayScreen } from '../../features/onboarding/screens/PersonalizeDayScreen';
import { LocationAccessScreen } from '../../features/onboarding/screens/LocationAccessScreen';
import { CalendarScreen } from '../../features/scheduler/screens/CalendarScreen';
import { ChatScreen } from '../../features/chat/screens/ChatScreen';
import { useAuthSession } from '../../features/auth/hooks/useAuthSession';
import { TabBar } from './TabBar';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const [addingSchedule, setAddingSchedule] = useState(false);

  const renderTabBar = (props: BottomTabBarProps) => {
    const activeRoute = props.state.routes[props.state.index]?.name;
    if (activeRoute === 'Chat') return null;
    return <TabBar {...props} onAddPress={() => setAddingSchedule(true)} />;
  };

  return (
    <>
      <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Tasks" component={TasksScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />

        <Tab.Screen name="Calendar" component={CalendarScreen} />
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
