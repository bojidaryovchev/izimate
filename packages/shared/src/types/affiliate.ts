import type { UUID, ISODateTime, Timestamps, CurrencyCode } from './common';
import type {
  AffiliateTier,
  ReferralStatus,
  CommissionStatus,
  PayoutMethod,
} from './enums';

// ─── Affiliate ─────────────────────────────────────────────────────────────────

export interface Affiliate extends Timestamps {
  id: UUID;
  user_id: UUID;
  referral_code: string;
  tier: AffiliateTier;
  total_referrals: number;
  total_earnings: number;
  pending_earnings: number;
  currency: CurrencyCode;
  payout_method: PayoutMethod | null;
  stripe_connect_account_id: string | null;
  is_active: boolean;
}

// ─── Referral ──────────────────────────────────────────────────────────────────

export interface Referral extends Timestamps {
  id: UUID;
  affiliate_id: UUID;
  referred_user_id: UUID | null;
  referral_code: string;
  plan_type: string | null;
  status: ReferralStatus;
  commission_amount: number | null;
  commission_currency: CurrencyCode | null;
  converted_at: ISODateTime | null;
  expires_at: ISODateTime | null;
}

// ─── Commission Payment ────────────────────────────────────────────────────────

export interface CommissionPayment extends Timestamps {
  id: UUID;
  affiliate_id: UUID;
  referral_id: UUID;
  amount: number;
  currency: CurrencyCode;
  status: CommissionStatus;
  paid_at: ISODateTime | null;
  payout_method: PayoutMethod | null;
  payout_reference: string | null;
}
