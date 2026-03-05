import type { UUID, ISODateTime, Timestamps } from './common';
import type { VerificationType, VerificationRecordStatus } from './enums';

// ─── Verification History ──────────────────────────────────────────────────────

export interface VerificationHistory extends Timestamps {
  id: UUID;
  user_id: UUID;
  verification_type: VerificationType;
  status: VerificationRecordStatus;
  didit_verification_id: string | null;
  notes: string | null;
  verified_at: ISODateTime | null;
  expires_at: ISODateTime | null;
}
