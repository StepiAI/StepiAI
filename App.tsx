/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import './global.css';
import { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { AppProviders } from './src/app/providers';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { setupNotificationListeners } from './src/services/notifications/client';
import { configureGoogleSignin } from './src/features/auth/services/googleSigninConfig';

configureGoogleSignin();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const unsubscribe = setupNotificationListeners();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AppProviders>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <RootNavigator />
    </AppProviders>
  );
}

export default App;
