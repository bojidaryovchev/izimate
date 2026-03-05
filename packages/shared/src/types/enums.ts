// ─── Listing ───────────────────────────────────────────────────────────────────

export type ListingType =
  | 'service'
  | 'goods'
  | 'rental'
  | 'experience'
  | 'fundraising'
  | 'transportation'
  | 'digital_services'
  | 'gated_content';

export type ListingRole = 'offer' | 'need';

export type ListingStatus =
  | 'draft'
  | 'active'
  | 'matched'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type BudgetType =
  | 'fixed'
  | 'range'
  | 'hourly'
  | 'price_list'
  | 'auction'
  | 'lottery';

export type Urgency = 'asap' | 'this_week' | 'flexible';

// ─── Booking ───────────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'declined'
  | 'disputed'
  | 'no_show'
  | 'negotiating';

export type BookingStep =
  | 'calendar'
  | 'guest-checkout'
  | 'user-checkout'
  | 'biometric-confirmation'
  | 'deposit-payment'
  | 'complete';

// ─── Match ─────────────────────────────────────────────────────────────────────

export type MatchStatus =
  | 'pending'
  | 'negotiating'
  | 'agreed'
  | 'booked'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// ─── Swipe ─────────────────────────────────────────────────────────────────────

export type SwipeDirection = 'right' | 'left' | 'super';

export type SwipeType =
  | 'provider_on_listing'
  | 'customer_on_provider'
  | 'customer_on_listing';

// ─── Review ────────────────────────────────────────────────────────────────────

export type ReviewStatus = 'pending' | 'published' | 'flagged' | 'removed';

// ─── Messaging ─────────────────────────────────────────────────────────────────

export type MessageType =
  | 'text'
  | 'image'
  | 'price_proposal'
  | 'date_proposal'
  | 'system'
  | 'booking_request'
  | 'booking_update';

// ─── Notification ──────────────────────────────────────────────────────────────

export type NotificationType =
  | 'match'
  | 'interested'
  | 'message'
  | 'review'
  | 'pending_approval'
  | 'rejection'
  | 'liked'
  | 'booking_confirmed'
  | 'booking_request'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'booking_reminder'
  | 'booking_status_update'
  | 'followed_user_new_listing'
  | 'new_follower'
  | 'raffle_ticket_purchased'
  | 'raffle_winner'
  | 'raffle_ended'
  | 'raffle_ending_soon';

// ─── User / Verification ───────────────────────────────────────────────────────

export type VerificationStatus = 'unverified' | 'verified' | 'pro';

export type IdentityVerificationStatus =
  | 'pending'
  | 'processing'
  | 'verified'
  | 'failed'
  | 'rejected';

export type BackgroundCheckStatus = 'none' | 'pending' | 'passed' | 'failed';

export type PriceTier = '$' | '$$' | '$$$';

export type VerificationType =
  | 'identity'
  | 'background_check'
  | 'license'
  | 'insurance'
  | 'business';

export type VerificationRecordStatus =
  | 'pending'
  | 'processing'
  | 'verified'
  | 'failed'
  | 'rejected';

// ─── Monetization ──────────────────────────────────────────────────────────────

export type PlanType = 'free' | 'pro' | 'business';

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'past_due'
  | 'trialing'
  | 'expired';

export type PromotionType = 'boost' | 'sponsored' | 'featured' | 'traffic_boost';

// ─── Affiliate ─────────────────────────────────────────────────────────────────

export type AffiliateTier = 'standard' | 'premium' | 'elite';

export type ReferralStatus =
  | 'pending'
  | 'converted'
  | 'active'
  | 'cancelled'
  | 'expired';

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'cancelled';

export type PayoutMethod =
  | 'bank_transfer'
  | 'revolut'
  | 'paypal'
  | 'stripe'
  | 'account_credit';

// ─── Donation ──────────────────────────────────────────────────────────────────

export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type RecurringFrequency = 'monthly' | 'quarterly' | 'yearly';

// ─── Auction & Raffle ──────────────────────────────────────────────────────────

export type AuctionStatus = 'upcoming' | 'active' | 'ended' | 'sold' | 'cancelled';

export type RaffleStatus = 'upcoming' | 'active' | 'ended' | 'drawn' | 'cancelled';

export type TicketPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// ─── Approval ──────────────────────────────────────────────────────────────────

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// ─── Ads ───────────────────────────────────────────────────────────────────────

export type BusinessAdStatus =
  | 'pending_payment'
  | 'pending_review'
  | 'active'
  | 'paused'
  | 'expired'
  | 'rejected';

export type BusinessAdPlan = 'starter' | 'growth' | 'premium';

// ─── Content Access ────────────────────────────────────────────────────────────

export type AccessLevel = 'free' | 'premium' | 'vip';

// ─── Listing Type-Specific Enums ───────────────────────────────────────────────

export type BookFormat = 'physical' | 'ebook' | 'both';

export type FreelanceCategory =
  | 'ugc'
  | 'design'
  | 'writing'
  | 'video'
  | 'photography'
  | 'social_media'
  | 'consulting'
  | 'other';

export type SpaceType =
  | 'parking'
  | 'storage'
  | 'workspace'
  | 'event_venue'
  | 'studio'
  | 'kitchen'
  | 'couchsurfing'
  | 'other';

export type FundraisingCategory =
  | 'charity'
  | 'personal'
  | 'business'
  | 'event'
  | 'medical'
  | 'education'
  | 'other';

export type DeliveryType = 'food' | 'grocery' | 'package' | 'medicine' | 'other';

export type TaxiVehicleType =
  | 'standard'
  | 'luxury'
  | 'van'
  | 'motorcycle'
  | 'bike';

export type RentalDurationType = 'hourly' | 'daily' | 'weekly' | 'monthly';

export type TransportPricingModel =
  | 'per_km'
  | 'per_hour'
  | 'per_package'
  | 'per_weight'
  | 'fixed';

export type GatedContentType =
  | 'blog'
  | 'newsletter'
  | 'video_series'
  | 'podcast'
  | 'course'
  | 'community_access';
