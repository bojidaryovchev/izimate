import type {
  UUID,
  ISODateTime,
  Timestamps,
  Location,
  CurrencyCode,
} from './common';
import type {
  VerificationStatus,
  IdentityVerificationStatus,
  BackgroundCheckStatus,
  PriceTier,
  PlanType,
} from './enums';

// ─── User ──────────────────────────────────────────────────────────────────────

export interface User extends Timestamps {
  id: UUID;
  email: string;
  name: string;
  avatar_url: string | null;
  cover_picture_url: string | null;
  phone: string | null;

  // Location
  location: Location | null;

  // Profile
  bio: string | null;
  date_of_birth: ISODateTime | null;

  // Verification
  verification_status: VerificationStatus;
  identity_verification_status: IdentityVerificationStatus;
  business_verified: boolean;

  // Referral
  referral_code: string | null;
  referred_by: UUID | null;

  // Social
  website_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  tiktok_url: string | null;

  // Push
  push_token: string | null;

  // Onboarding
  onboarding_completed: boolean;
  is_active: boolean;

  // Plan
  plan_type: PlanType;
}

// ─── Provider Profile ──────────────────────────────────────────────────────────

export interface ProviderProfile extends Timestamps {
  id: UUID;
  user_id: UUID;

  // Service info
  services_offered: string[];
  expertise_tags: string[];
  hourly_rate: number | null;
  price_tier: PriceTier | null;
  currency: CurrencyCode;

  // Portfolio
  portfolio_photos: string[];

  // Stats
  jobs_completed: number;
  rating: number;
  total_reviews: number;
  response_time_hours: number | null;

  // Availability
  is_available_now: boolean;

  // Verification
  background_check_status: BackgroundCheckStatus;
  verification_documents: string[];

  // Cal.com integration
  calcom_api_key: string | null;
  calcom_event_type_id: number | null;
  calcom_username: string | null;
}
