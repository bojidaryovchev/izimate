import type { PlanType } from '../types';

// ─── Quota Defaults Per Plan ───────────────────────────────────────────────────

export interface QuotaDefaults {
  listings: number;
  super_likes: number;
  featured: number;
  boosts: number;
  leads: number;
  traffic_boosts: number;
}

export const QUOTA_DEFAULTS: Record<PlanType, QuotaDefaults> = {
  free: {
    listings: 5,
    super_likes: 3,
    featured: 0,
    boosts: 0,
    leads: 0,
    traffic_boosts: 0,
  },
  pro: {
    listings: 20,
    super_likes: 10,
    featured: 2,
    boosts: 5,
    leads: 10,
    traffic_boosts: 2,
  },
  business: {
    listings: 999,
    super_likes: 30,
    featured: 10,
    boosts: 20,
    leads: 50,
    traffic_boosts: 10,
  },
};

// ─── Plan Labels ───────────────────────────────────────────────────────────────

export const PLAN_LABELS: Record<PlanType, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
};

// ─── Pagination Defaults ───────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE = 1;

// ─── Error Codes ───────────────────────────────────────────────────────────────

export const ERROR_CODES = {
  // Auth
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // User
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_DEACTIVATED: 'USER_DEACTIVATED',

  // Listing
  LISTING_NOT_FOUND: 'LISTING_NOT_FOUND',
  LISTING_EXPIRED: 'LISTING_EXPIRED',
  LISTING_QUOTA_EXCEEDED: 'LISTING_QUOTA_EXCEEDED',

  // Booking
  BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',
  BOOKING_CONFLICT: 'BOOKING_CONFLICT',
  BOOKING_ALREADY_CANCELLED: 'BOOKING_ALREADY_CANCELLED',

  // Match
  MATCH_NOT_FOUND: 'MATCH_NOT_FOUND',
  MATCH_ALREADY_EXISTS: 'MATCH_ALREADY_EXISTS',

  // Swipe
  SWIPE_QUOTA_EXCEEDED: 'SWIPE_QUOTA_EXCEEDED',
  SWIPE_DUPLICATE: 'SWIPE_DUPLICATE',

  // Payment
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_REQUIRES_ACTION: 'PAYMENT_REQUIRES_ACTION',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Generic
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ─── Notification Type Labels ──────────────────────────────────────────────────

import type { NotificationType } from '../types';

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  match: 'New Match',
  interested: 'Someone Interested',
  message: 'New Message',
  review: 'New Review',
  pending_approval: 'Pending Approval',
  rejection: 'Request Rejected',
  liked: 'Liked',
  booking_confirmed: 'Booking Confirmed',
  booking_request: 'Booking Request',
  booking_cancelled: 'Booking Cancelled',
  booking_completed: 'Booking Completed',
  booking_reminder: 'Booking Reminder',
  booking_status_update: 'Booking Update',
  followed_user_new_listing: 'New Listing from Followed',
  new_follower: 'New Follower',
  raffle_ticket_purchased: 'Raffle Ticket Purchased',
  raffle_winner: 'Raffle Winner',
  raffle_ended: 'Raffle Ended',
  raffle_ending_soon: 'Raffle Ending Soon',
};

// ─── Limits ────────────────────────────────────────────────────────────────────

export const LIMITS = {
  LISTING_TITLE_MIN: 3,
  LISTING_TITLE_MAX: 100,
  LISTING_DESCRIPTION_MIN: 10,
  LISTING_DESCRIPTION_MAX: 2000,
  LISTING_TAGS_MAX: 10,
  LISTING_PHOTOS_MAX: 10,
  BIO_MAX: 500,
  NAME_MAX: 100,
  REVIEW_COMMENT_MIN: 10,
  REVIEW_COMMENT_MAX: 2000,
  REVIEW_PHOTOS_MAX: 5,
  MESSAGE_MAX: 5000,
  CUSTOMER_NOTES_MAX: 1000,
  RAFFLE_TICKETS_MAX_PER_PURCHASE: 100,
} as const;

// ─── Feature Flags Type ────────────────────────────────────────────────────────

export interface FeatureFlags {
  enableAuctions: boolean;
  enableRaffles: boolean;
  enableGatedContent: boolean;
  enableBusinessAds: boolean;
  enableGuestCheckout: boolean;
  enableAffiliate: boolean;
  enableCalcomIntegration: boolean;
  enableRecurringBookings: boolean;
  enableDonations: boolean;
  enableTransportation: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableAuctions: true,
  enableRaffles: true,
  enableGatedContent: true,
  enableBusinessAds: false,
  enableGuestCheckout: true,
  enableAffiliate: true,
  enableCalcomIntegration: true,
  enableRecurringBookings: true,
  enableDonations: true,
  enableTransportation: true,
};
