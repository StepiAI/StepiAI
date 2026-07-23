import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../../app/navigation/types';
import { EventDetailScreen } from './EventDetailScreen';

// pembungkus EventDetailScreen biar bisa dibuka lewat navigasi (mis. dari
// Missing Details). EventDetailScreen sendiri masih dipakai inline di Home
// lewat state lokal, jadi versinya yg berbasis props dibiarin apa adanya.
export function EventDetailRoute() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'EventDetail'>>();

  const event = route.params?.event;
  const dayIso = route.params?.dayIso;

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  };

  if (!event) {
    goBack();
    return null;
  }

  return (
    <EventDetailScreen
      event={event}
      day={dayIso ? new Date(dayIso) : new Date()}
      onBack={goBack}
      onChanged={goBack}
    />
  );
}
