/**
 * @format
 */

import 'react-native-url-polyfill/auto';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import App from './App';
import { name as appName } from './app.json';
import { widgetTaskHandler } from './src/features/widget/widgetTaskHandler';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background notification:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);

// biar android bisa manggil task ini pas app nya ga jalan
registerWidgetTaskHandler(widgetTaskHandler);
