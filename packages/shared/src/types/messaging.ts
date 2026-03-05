import type { UUID, Timestamps } from './common';
import type { MessageType } from './enums';

// ─── Message ───────────────────────────────────────────────────────────────────

export interface Message extends Timestamps {
  id: UUID;
  match_id: UUID;
  sender_id: UUID;
  content: string;
  message_type: MessageType;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
}
