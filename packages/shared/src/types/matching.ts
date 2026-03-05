import type { UUID, ISODateTime, Timestamps, CurrencyCode } from './common';
import type { SwipeDirection, SwipeType, MatchStatus, ApprovalStatus } from './enums';

// ─── Swipe ─────────────────────────────────────────────────────────────────────

export interface Swipe extends Timestamps {
  id: UUID;
  swiper_id: UUID;
  listing_id: UUID;
  provider_id: UUID | null;
  swipe_type: SwipeType;
  direction: SwipeDirection;
}

// ─── Match ─────────────────────────────────────────────────────────────────────

export interface Match extends Timestamps {
  id: UUID;
  listing_id: UUID;
  customer_id: UUID;
  provider_id: UUID;
  status: MatchStatus;

  // Negotiation
  proposed_price: number | null;
  final_price: number | null;
  currency: CurrencyCode;
  proposed_date: ISODateTime | null;
  final_date: ISODateTime | null;

  // Engagement
  super_liked_by: UUID | null;
}

// ─── Pending Approval ──────────────────────────────────────────────────────────

export interface PendingApproval extends Timestamps {
  id: UUID;
  match_id: UUID;
  listing_id: UUID;
  customer_id: UUID;
  provider_id: UUID;

  // Request
  requested_time: ISODateTime | null;
  requested_price: number | null;
  currency: CurrencyCode;
  customer_message: string | null;

  // Status
  status: ApprovalStatus;
  expires_at: ISODateTime;
}
