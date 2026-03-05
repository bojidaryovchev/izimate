import type { UUID, ISODateTime, Timestamps } from './common';
import type { ReviewStatus } from './enums';

// ─── Review ────────────────────────────────────────────────────────────────────

export interface Review extends Timestamps {
  id: UUID;
  booking_id: UUID;
  reviewer_id: UUID;
  reviewee_id: UUID;
  listing_id: UUID;
  rating: number;
  comment: string | null;
  photos: string[];
  status: ReviewStatus;
}

// ─── Review Incentive ──────────────────────────────────────────────────────────

export interface ReviewIncentive extends Timestamps {
  id: UUID;
  booking_id: UUID;
  user_id: UUID;
  discount_percentage: number;
  discount_code: string | null;
  redeemed: boolean;
  redeemed_at: ISODateTime | null;
  expires_at: ISODateTime;
}
