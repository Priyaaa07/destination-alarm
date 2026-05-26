export interface User {
  name: string;
  email: string;
  bloodGroup: string;
  avatar: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface JourneyHistory {
  id: string;
  destination: string;
  date: string;
  triggerDistance: number;
  status: 'Completed' | 'Alarm Triggered' | 'Emergency Alert Sent';
}

export type TriggerDistance = 2 | 5 | 10;

export interface AppSettings {
  defaultTrigger: TriggerDistance;
  autoAlert: boolean;
  notifications: boolean;
  offlineMode: boolean;
  darkMode: boolean;
}
