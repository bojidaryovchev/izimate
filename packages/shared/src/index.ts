export const APP_NAME = "izimate";

// --- App Event type for SNS realtime events ---

export interface AppEvent {
  type: string;
  namespace: string;
  room: string;
  data: unknown;
}
