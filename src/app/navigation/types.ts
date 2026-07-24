import type { ScheduleAlert } from '../../services/alerts/client';
import type { TimelineEvent } from '../../features/scheduler/utils/timeline';

export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Summary: undefined;
  Profile: undefined;
  Calendar: undefined;
  AdjustSchedule: { alert: ScheduleAlert } | undefined;
  MissingDetails: undefined;
  // dayIso dikirim string biar param-nya serializable
  EventDetail: { event: TimelineEvent; dayIso: string };
  Chat: undefined;
  ConnectedApps: undefined;
  Accessibility: undefined;
  Notifications: undefined;
  HelpCenter: undefined;
  // sementara, biar screen onboarding nya gampang dibuka pas ngerjain UI
  Personalize: undefined;
  Location: undefined;
};
