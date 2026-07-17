import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../../features/scheduler/screens/HomeScreen';
import { TasksScreen } from '../../features/tasks/screens/TasksScreen';
import { SummaryScreen } from '../../features/summary/screens/SummaryScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { RegisterScreen } from '../../features/auth/screens/RegisterScreen';
import { useAuthSession } from '../../features/auth/hooks/useAuthSession';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Summary" component={SummaryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
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
