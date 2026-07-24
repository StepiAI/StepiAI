import { useEffect, useRef, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps, BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
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
import { ConnectCalendarScreen } from '../../features/onboarding/screens/ConnectCalendarScreen';
import { useGoogleCalendarConnection } from '../../features/settings/hooks/useGoogleCalendarConnection';
// onboarding (Personalize/Location) di-skip dulu — screen-nya masih ada, tinggal
// aktifin lagi nanti. lihat SignedInApp di bawah.
// import { OnboardingFlow } from '../../features/onboarding/screens/OnboardingFlow';
// import { useOnboardingStatus } from '../../features/onboarding/hooks/useOnboardingStatus';
import { CalendarScreen } from '../../features/scheduler/screens/CalendarScreen';
import { AdjustScheduleScreen } from '../../features/scheduler/screens/AdjustScheduleScreen';
import { MissingDetailsScreen } from '../../features/scheduler/screens/MissingDetailsScreen';
import { EventDetailRoute } from '../../features/scheduler/screens/EventDetailRoute';
import { ChatScreen } from '../../features/chat/screens/ChatScreen';
import { useAuthSession } from '../../features/auth/hooks/useAuthSession';
import { supabase } from '../../services/supabase/client';
import { TabBar } from './TabBar';
import { TabBarVisibilityContext } from './TabBarVisibilityContext';
import { MainTabParamList } from './types';

import { SplashScreen } from '../../features/auth/screens/SplashScreen';
import { OnboardingFeatureScreen } from '../../features/onboarding/screens/OnboardingFeatureScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// screen yg punya header sendiri / full-screen, tab bar-nya disembunyiin
const FULL_SCREEN_ROUTES: (keyof MainTabParamList)[] = [
  'Chat',
  'ConnectedApps',
  'Accessibility',
  'Notifications',
  'HelpCenter',
  'AdjustSchedule',
  'MissingDetails',
  'EventDetail',
  'Personalize',
  'Location',
];

// Personalize & Location dipajang juga sebagai tab (buat ngerjain UI). Di sini
// dibungkus biar tombol back-nya kepasang ke navigasi — di alur onboarding
// beneran, screen-nya dipanggil langsung dgn callback sendiri.
function PersonalizeTab() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const back = () =>
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home');
  return <PersonalizeDayScreen onBack={back} onContinue={() => navigation.navigate('Location')} />;
}

function LocationTab() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const back = () =>
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home');
  const goHome = () => navigation.navigate('Home');
  return <LocationAccessScreen onBack={back} onAllow={goHome} onSkip={goHome} />;
}

function MainTabs() {
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [tabBarHidden, setTabBarHidden] = useState(false);

  const tabBarVisibility = useMemo(
    () => ({ hidden: tabBarHidden, setHidden: setTabBarHidden }),
    [tabBarHidden],
  );

  const renderTabBar = (props: BottomTabBarProps) => {
    const activeRoute = props.state.routes[props.state.index]?.name as keyof MainTabParamList;
    if (tabBarHidden || FULL_SCREEN_ROUTES.includes(activeRoute)) return null;
    return <TabBar {...props} onAddPress={() => setAddingSchedule(true)} />;
  };

  return (
    <TabBarVisibilityContext.Provider value={tabBarVisibility}>
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
        <Tab.Screen name="MissingDetails" component={MissingDetailsScreen} />
        <Tab.Screen name="EventDetail" component={EventDetailRoute} />
        <Tab.Screen name="Summary" component={SummaryScreen} />
        <Tab.Screen name="Personalize" component={PersonalizeTab} />
        <Tab.Screen name="Location" component={LocationTab} />
      </Tab.Navigator>

      <NewScheduleModal
        visible={addingSchedule}
        onClose={() => setAddingSchedule(false)}
      />
    </TabBarVisibilityContext.Provider>
  );
}

// setelah login, urutan gate-nya:
// 1. Google Calendar belum kesambung -> wajib connect dulu (skip kalau udah).
// 2. baru masuk ke tab utama.
//
// NOTE: step onboarding (Personalize -> Location) lagi di-skip dulu. Screen-nya
// masih ada & masih kebuka lewat dev tab; buat ngaktifin lagi, uncomment import
// OnboardingFlow/useOnboardingStatus di atas + blok "gate 2" di bawah.
function SignedInApp() {
  const {
    status: gcStatus,
    busy: gcBusy,
    error: gcError,
    toggleConnection,
  } = useGoogleCalendarConnection();

  const loadingSpinner = (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator />
    </View>
  );

  // masih ngecek status koneksi kalender
  if (gcStatus === null) return loadingSpinner;

  // gate 1: wajib connect Google Calendar. begitu connected, re-render & lanjut.
  if (!gcStatus.connected) {
    return (
      <ConnectCalendarScreen
        busy={gcBusy}
        error={gcError}
        onConnect={toggleConnection}
        // back = sign out -> balik ke halaman login (RegisterScreen)
        onBack={() => {
          supabase.auth.signOut();
        }}
      />
    );
  }

  // gate 2 (onboarding) di-skip dulu:
  // const { status: onboarding, complete } = useOnboardingStatus(session);
  // if (onboarding === 'loading') return loadingSpinner;
  // if (onboarding === 'needed') return <OnboardingFlow onDone={complete} />;

  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

export function RootNavigator() {
  const { session, loading } = useAuthSession();
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const prevSessionRef = useRef(session);

  useEffect(() => {
    // If user signs out (session was active and becomes null)
    if (prevSessionRef.current && !session) {
      setHasSeenOnboarding(true); // Bring directly to RegisterScreen with '‹ Features' link available
    }
    prevSessionRef.current = session;
  }, [session]);

  if (showSplash || loading) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (session) {
    return <SignedInApp />;
  }

  if (!hasSeenOnboarding) {
    return <OnboardingFeatureScreen onFinish={() => setHasSeenOnboarding(true)} />;
  }

  return (
    <NavigationContainer>
      <RegisterScreen onBackToOnboarding={() => setHasSeenOnboarding(false)} />
    </NavigationContainer>
  );
}
