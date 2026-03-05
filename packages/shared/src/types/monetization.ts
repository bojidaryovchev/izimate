import type { UUID, ISODateTime, Timestamps, CurrencyCode } from './common';
import type {
  PlanType,
  SubscriptionStatus,
  PromotionType,
} from './enums';

// ─── User Subscription ────────────────────────────────────────────────────────

export interface UserSubscription extends Timestamps {
  id: UUID;
  user_id: UUID;
  plan_type: PlanType;
  status: SubscriptionStatus;

  // Stripe
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;

  // PayPal
  paypal_subscription_id: string | null;
  paypal_plan_id: string | null;

  // Trial
  is_trial: boolean;
  trial_start: ISODateTime | null;
  trial_end: ISODateTime | null;

  // Period
  current_period_start: ISODateTime | null;
  current_period_end: ISODateTime | null;
}

// ─── User Quota ────────────────────────────────────────────────────────────────

export interface UserQuota extends Timestamps {
  id: UUID;
  user_id: UUID;
  plan_type: PlanType;

  // Limits
  listings_limit: number;
  listings_used: number;
  super_likes_limit: number;
  super_likes_used: number;
  featured_limit: number;
  featured_used: number;
  boosts_limit: number;
  boosts_used: number;
  leads_limit: number;
  leads_used: number;
  traffic_boosts_limit: number;
  traffic_boosts_used: number;

  // Reset
  resets_at: ISODateTime;
}

// ─── Boost Purchase ────────────────────────────────────────────────────────────

export interface BoostPurchase extends Timestamps {
  id: UUID;
  user_id: UUID;
  listing_id: UUID | null;
  boost_type: PromotionType;
  quantity: number;
  amount: number;
  currency: CurrencyCode;
  payment_intent_id: string | null;
  expires_at: ISODateTime | null;
}

// ─── Boost Usage Log ───────────────────────────────────────────────────────────

export interface BoostUsageLog extends Timestamps {
  id: UUID;
  user_id: UUID;
  listing_id: UUID;
  boost_type: PromotionType;
  impressions: number;
  clicks: number;
  started_at: ISODateTime;
  ended_at: ISODateTime | null;
}

// ─── Promoted Listing ──────────────────────────────────────────────────────────

export interface PromotedListing extends Timestamps {
  id: UUID;
  listing_id: UUID;
  user_id: UUID;
  promotion_type: PromotionType;
  priority: number;
  impressions: number;
  clicks: number;
  budget: number | null;
  spent: number;
  currency: CurrencyCode;
  starts_at: ISODateTime;
  ends_at: ISODateTime;
  is_active: boolean;
}

// ─── Stripe Addon Product ──────────────────────────────────────────────────────

export interface StripeAddonProduct {
  id: UUID;
  name: string;
  stripe_product_id: string;
  stripe_price_id: string;
  type: PromotionType;
  quantity: number;
  price: number;
  currency: CurrencyCode;
  is_active: boolean;
}
