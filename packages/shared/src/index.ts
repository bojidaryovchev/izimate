export const APP_NAME = "izimate";

// --- Image optimization ---
export { optimizedImageUrl } from "./image.js";

// --- User schemas ---
export { UpdateUserSchema, UserSchema, type UpdateUser, type User } from "./schemas/users.js";

// --- App Event type for SNS realtime events ---

export interface AppEvent {
  type: string;
  namespace: string;
  room: string;
  data: unknown;
}
