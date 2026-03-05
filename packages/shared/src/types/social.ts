import type { UUID, Timestamps } from './common';

// ─── User Follow ───────────────────────────────────────────────────────────────

export interface UserFollow extends Timestamps {
  id: UUID;
  follower_id: UUID;
  following_id: UUID;
}
