import type { UUID, ISODateTime, Timestamps, CurrencyCode } from './common';
import type { BusinessAdStatus, BusinessAdPlan } from './enums';

// ─── Business Ad ───────────────────────────────────────────────────────────────

export interface BusinessAd extends Timestamps {
  id: UUID;
  user_id: UUID;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  cta_text: string | null;

  // Targeting
  target_categories: string[];
  target_locations: string[];
  target_radius_km: number | null;

  // Plan & status
  plan: BusinessAdPlan;
  status: BusinessAdStatus;
  reviewed_by: UUID | null;
  rejection_reason: string | null;

  // Budget
  daily_budget: number | null;
  total_budget: number;
  spent: number;
  currency: CurrencyCode;

  // Schedule
  starts_at: ISODateTime;
  ends_at: ISODateTime;

  // Performance
  impressions: number;
  clicks: number;
  conversions: number;
}

// ─── Business Ad Event ─────────────────────────────────────────────────────────

export interface BusinessAdEvent extends Timestamps {
  id: UUID;
  ad_id: UUID;
  user_id: UUID | null;
  event_type: 'impression' | 'click' | 'conversion';
  metadata: Record<string, unknown> | null;
}

// ─── External Ad Placement ─────────────────────────────────────────────────────

export interface ExternalAdPlacement extends Timestamps {
  id: UUID;
  provider: string;
  placement_id: string;
  position: string;
  is_active: boolean;
}
