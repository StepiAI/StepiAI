/**
 * @format
 */

import 'react-native-url-polyfill/auto';
import { AppRegistry } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import App from './App';
import { name as appName } from './app.json';
import { widgetTaskHandler } from './src/features/widget/widgetTaskHandler';

AppRegistry.registerComponent(appName, () => App);

// biar android bisa manggil task ini pas app nya ga jalan
registerWidgetTaskHandler(widgetTaskHandler);
