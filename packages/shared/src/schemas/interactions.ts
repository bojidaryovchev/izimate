import { z } from 'zod';

// ─── Review Schemas ────────────────────────────────────────────────────────────

export const ReviewStatusSchema = z.enum(['pending', 'published', 'flagged', 'removed']);

export const CreateReviewSchema = z.object({
  booking_id: z.string().uuid(),
  reviewee_id: z.string().uuid(),
  listing_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(2000).optional(),
  photos: z.array(z.string().url()).max(5).default([]),
});

export const UpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(10).max(2000).nullable().optional(),
  photos: z.array(z.string().url()).max(5).optional(),
});

// ─── Message Schemas ───────────────────────────────────────────────────────────

export const MessageTypeSchema = z.enum([
  'text', 'image', 'price_proposal', 'date_proposal',
  'system', 'booking_request', 'booking_update',
]);

export const SendMessageSchema = z.object({
  match_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
  message_type: MessageTypeSchema.default('text'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ─── Swipe Schemas ─────────────────────────────────────────────────────────────

export const SwipeDirectionSchema = z.enum(['right', 'left', 'super']);
export const SwipeTypeSchema = z.enum([
  'provider_on_listing', 'customer_on_provider', 'customer_on_listing',
]);

export const CreateSwipeSchema = z.object({
  listing_id: z.string().uuid(),
  provider_id: z.string().uuid().optional(),
  swipe_type: SwipeTypeSchema,
  direction: SwipeDirectionSchema,
});

// ─── Donation Schemas ──────────────────────────────────────────────────────────

export const CreateDonationSchema = z.object({
  listing_id: z.string().uuid(),
  amount: z.number().min(1),
  currency: z.string().default('GBP'),
  is_anonymous: z.boolean().default(false),
  recurring: z.boolean().default(false),
  recurring_frequency: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  dedicated_to: z.string().max(200).optional(),
});

// ─── Auction Bid Schemas ───────────────────────────────────────────────────────

export const CreateAuctionBidSchema = z.object({
  listing_id: z.string().uuid(),
  amount: z.number().min(0),
  currency: z.string().default('GBP'),
});

// ─── Raffle Ticket Schemas ─────────────────────────────────────────────────────

export const PurchaseRaffleTicketSchema = z.object({
  listing_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(100),
});
