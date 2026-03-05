import { z } from 'zod';
import { CurrencyCodeSchema, LocationSchema, PriceListItemSchema } from './common';

// ─── Enums ─────────────────────────────────────────────────────────────────────

export const ListingTypeSchema = z.enum([
  'service', 'goods', 'rental', 'experience', 'fundraising',
  'transportation', 'digital_services', 'gated_content',
]);

export const ListingRoleSchema = z.enum(['offer', 'need']);

export const ListingStatusSchema = z.enum([
  'draft', 'active', 'matched', 'in_progress', 'completed', 'cancelled', 'expired',
]);

export const BudgetTypeSchema = z.enum([
  'fixed', 'range', 'hourly', 'price_list', 'auction', 'lottery',
]);

export const UrgencySchema = z.enum(['asap', 'this_week', 'flexible']);

// ─── Create Listing: Basic Info ────────────────────────────────────────────────

export const ListingBasicInfoSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  listing_type: ListingTypeSchema,
  listing_role: ListingRoleSchema,
  category: z.string().min(1),
  subcategory: z.string().nullable().optional(),
  tags: z.array(z.string()).max(10).default([]),
  urgency: UrgencySchema.nullable().optional(),
});

// ─── Create Listing: Location ──────────────────────────────────────────────────

export const ListingLocationSchema = z.object({
  location: LocationSchema.nullable().optional(),
  is_remote: z.boolean().default(false),
  service_radius_km: z.number().min(0).nullable().optional(),
});

// ─── Create Listing: Budget ────────────────────────────────────────────────────

export const ListingBudgetSchema = z.object({
  budget_type: BudgetTypeSchema,
  budget_min: z.number().min(0).nullable().optional(),
  budget_max: z.number().min(0).nullable().optional(),
  fixed_price: z.number().min(0).nullable().optional(),
  hourly_rate: z.number().min(0).nullable().optional(),
  price_list: z.array(PriceListItemSchema).nullable().optional(),
  currency: CurrencyCodeSchema.default('GBP'),
});

// ─── Create Listing: Media ─────────────────────────────────────────────────────

export const ListingMediaSchema = z.object({
  photos: z.array(z.string().url()).max(10).default([]),
  video_url: z.string().url().nullable().optional(),
});

// ─── Full Create Listing Schema ────────────────────────────────────────────────

export const CreateListingSchema = ListingBasicInfoSchema
  .merge(ListingLocationSchema)
  .merge(ListingBudgetSchema)
  .merge(ListingMediaSchema)
  .extend({
    // Schedule
    available_from: z.string().datetime().nullable().optional(),
    available_until: z.string().datetime().nullable().optional(),

    // Type-specific (all optional — validated per listing_type)
    condition: z.string().nullable().optional(),
    brand: z.string().nullable().optional(),
    shipping_available: z.boolean().nullable().optional(),
    shipping_cost: z.number().min(0).nullable().optional(),

    book_author: z.string().nullable().optional(),
    book_isbn: z.string().nullable().optional(),
    book_format: z.enum(['physical', 'ebook', 'both']).nullable().optional(),
    book_page_count: z.number().int().min(1).nullable().optional(),

    content_url: z.string().url().nullable().optional(),
    content_type: z.enum(['blog', 'newsletter', 'video_series', 'podcast', 'course', 'community_access']).nullable().optional(),
    access_level: z.enum(['free', 'premium', 'vip']).nullable().optional(),
    preview_url: z.string().url().nullable().optional(),

    rental_duration_type: z.enum(['hourly', 'daily', 'weekly', 'monthly']).nullable().optional(),
    rental_deposit: z.number().min(0).nullable().optional(),
    rental_rules: z.string().max(2000).nullable().optional(),

    experience_duration_minutes: z.number().int().min(1).nullable().optional(),
    max_participants: z.number().int().min(1).nullable().optional(),
    includes: z.array(z.string()).nullable().optional(),
    requirements: z.array(z.string()).nullable().optional(),

    freelance_category: z.enum(['ugc', 'design', 'writing', 'video', 'photography', 'social_media', 'consulting', 'other']).nullable().optional(),
    turnaround_days: z.number().int().min(1).nullable().optional(),
    revisions_included: z.number().int().min(0).nullable().optional(),
    deliverables: z.array(z.string()).nullable().optional(),

    auction_start_price: z.number().min(0).nullable().optional(),
    auction_reserve_price: z.number().min(0).nullable().optional(),
    auction_starts_at: z.string().datetime().nullable().optional(),
    auction_ends_at: z.string().datetime().nullable().optional(),

    raffle_ticket_price: z.number().min(0).nullable().optional(),
    raffle_max_tickets: z.number().int().min(1).nullable().optional(),
    raffle_prize_description: z.string().max(1000).nullable().optional(),
    raffle_draw_date: z.string().datetime().nullable().optional(),

    space_type: z.enum(['parking', 'storage', 'workspace', 'event_venue', 'studio', 'kitchen', 'couchsurfing', 'other']).nullable().optional(),
    space_size_sqm: z.number().min(0).nullable().optional(),
    space_amenities: z.array(z.string()).nullable().optional(),

    fundraising_category: z.enum(['charity', 'personal', 'business', 'event', 'medical', 'education', 'other']).nullable().optional(),
    fundraising_goal: z.number().min(0).nullable().optional(),
    fundraising_deadline: z.string().datetime().nullable().optional(),

    transport_pricing_model: z.enum(['per_km', 'per_hour', 'per_package', 'per_weight', 'fixed']).nullable().optional(),
    transport_vehicle_type: z.string().nullable().optional(),

    delivery_type: z.enum(['food', 'grocery', 'package', 'medicine', 'other']).nullable().optional(),
    delivery_radius_km: z.number().min(0).nullable().optional(),
    estimated_delivery_minutes: z.number().int().min(1).nullable().optional(),

    taxi_vehicle_type: z.enum(['standard', 'luxury', 'van', 'motorcycle', 'bike']).nullable().optional(),
    taxi_max_passengers: z.number().int().min(1).nullable().optional(),

    subscription_price_monthly: z.number().min(0).nullable().optional(),
    subscription_price_yearly: z.number().min(0).nullable().optional(),
    subscription_features: z.array(z.string()).nullable().optional(),
  });

export const UpdateListingSchema = CreateListingSchema.partial();
