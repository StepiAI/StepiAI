import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../../features/scheduler/screens/HomeScreen';
import { TasksScreen } from '../../features/tasks/screens/TasksScreen';
import { SummaryScreen } from '../../features/summary/screens/SummaryScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { RegisterScreen } from '../../features/auth/screens/RegisterScreen';
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
  const [signedIn, setSignedIn] = useState(false);

  return (
    <NavigationContainer>
      {signedIn ? (
        <MainTabs />
      ) : (
        <RegisterScreen
          onSignUpWithGoogle={() => setSignedIn(true)}
          onLogIn={() => setSignedIn(true)}
        />
      )}
    </NavigationContainer>
  );
}
