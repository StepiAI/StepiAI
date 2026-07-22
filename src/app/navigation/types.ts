import type { ScheduleAlert } from '../../services/alerts/client';

export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Summary: undefined;
  Profile: undefined;
  Calendar: undefined;
  AdjustSchedule: { alert: ScheduleAlert } | undefined;
  Chat: undefined;
  ConnectedApps: undefined;
  Accessibility: undefined;
  Notifications: undefined;
  HelpCenter: undefined;
  // sementara, biar screen onboarding nya gampang dibuka pas ngerjain UI
  Personalize: undefined;
  Location: undefined;
};
