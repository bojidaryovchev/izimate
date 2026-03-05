import type { UUID, Timestamps } from './common';
import type { NotificationType } from './enums';

// ─── Notification ──────────────────────────────────────────────────────────────

export interface Notification extends Timestamps {
  id: UUID;
  user_id: UUID;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  data: Record<string, unknown> | null;
}

// ─── Notification Settings ─────────────────────────────────────────────────────

export interface NotificationSettings {
  id: UUID;
  user_id: UUID;
  push_enabled: boolean;
  email_enabled: boolean;
  match_notifications: boolean;
  message_notifications: boolean;
  booking_notifications: boolean;
  review_notifications: boolean;
  marketing_notifications: boolean;
}
