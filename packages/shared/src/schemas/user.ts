import { z } from 'zod';
import { LocationSchema } from './common';

// ─── Enums ─────────────────────────────────────────────────────────────────────

export const VerificationStatusSchema = z.enum(['unverified', 'verified', 'pro']);
export const IdentityVerificationStatusSchema = z.enum(['pending', 'processing', 'verified', 'failed', 'rejected']);
export const BackgroundCheckStatusSchema = z.enum(['none', 'pending', 'passed', 'failed']);
export const PriceTierSchema = z.enum(['$', '$$', '$$$']);
export const PlanTypeSchema = z.enum(['free', 'pro', 'business']);

// ─── User Schemas ──────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatar_url: z.string().url().nullable(),
  cover_picture_url: z.string().url().nullable(),
  phone: z.string().nullable(),
  location: LocationSchema.nullable(),
  bio: z.string().max(500).nullable(),
  date_of_birth: z.string().datetime().nullable(),
  verification_status: VerificationStatusSchema,
  identity_verification_status: IdentityVerificationStatusSchema,
  business_verified: z.boolean(),
  referral_code: z.string().nullable(),
  referred_by: z.string().uuid().nullable(),
  website_url: z.string().url().nullable(),
  instagram_url: z.string().url().nullable(),
  twitter_url: z.string().url().nullable(),
  linkedin_url: z.string().url().nullable(),
  tiktok_url: z.string().url().nullable(),
  push_token: z.string().nullable(),
  onboarding_completed: z.boolean(),
  is_active: z.boolean(),
  plan_type: PlanTypeSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatar_url: z.string().url().optional(),
  phone: z.string().optional(),
  referred_by: z.string().uuid().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().nullable().optional(),
  cover_picture_url: z.string().url().nullable().optional(),
  phone: z.string().nullable().optional(),
  location: LocationSchema.nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  date_of_birth: z.string().datetime().nullable().optional(),
  website_url: z.string().url().nullable().optional(),
  instagram_url: z.string().url().nullable().optional(),
  twitter_url: z.string().url().nullable().optional(),
  linkedin_url: z.string().url().nullable().optional(),
  tiktok_url: z.string().url().nullable().optional(),
  push_token: z.string().nullable().optional(),
});

// ─── Provider Profile Schemas ──────────────────────────────────────────────────

export const ProviderProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  services_offered: z.array(z.string()),
  expertise_tags: z.array(z.string()),
  hourly_rate: z.number().min(0).nullable(),
  price_tier: PriceTierSchema.nullable(),
  currency: z.string(),
  portfolio_photos: z.array(z.string().url()),
  jobs_completed: z.number().int().min(0),
  rating: z.number().min(0).max(5),
  total_reviews: z.number().int().min(0),
  response_time_hours: z.number().min(0).nullable(),
  is_available_now: z.boolean(),
  background_check_status: BackgroundCheckStatusSchema,
  verification_documents: z.array(z.string()),
  calcom_api_key: z.string().nullable(),
  calcom_event_type_id: z.number().int().nullable(),
  calcom_username: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateProviderProfileSchema = z.object({
  services_offered: z.array(z.string().min(1)).min(1),
  expertise_tags: z.array(z.string()).default([]),
  hourly_rate: z.number().min(0).optional(),
  price_tier: PriceTierSchema.optional(),
  currency: z.string().default('GBP'),
});

export const UpdateProviderProfileSchema = z.object({
  services_offered: z.array(z.string().min(1)).min(1).optional(),
  expertise_tags: z.array(z.string()).optional(),
  hourly_rate: z.number().min(0).nullable().optional(),
  price_tier: PriceTierSchema.nullable().optional(),
  currency: z.string().optional(),
  portfolio_photos: z.array(z.string().url()).optional(),
  is_available_now: z.boolean().optional(),
  calcom_api_key: z.string().nullable().optional(),
  calcom_event_type_id: z.number().int().nullable().optional(),
  calcom_username: z.string().nullable().optional(),
});
