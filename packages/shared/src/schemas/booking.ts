import { z } from 'zod';
import { CurrencyCodeSchema, LocationSchema } from './common';

// ─── Enums ─────────────────────────────────────────────────────────────────────

export const BookingStatusSchema = z.enum([
  'pending', 'confirmed', 'in_progress', 'completed',
  'cancelled', 'declined', 'disputed', 'no_show', 'negotiating',
]);

// ─── Booking Date Selection ────────────────────────────────────────────────────

export const BookingDateSchema = z.object({
  date: z.string().datetime(),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  service_name: z.string().min(1),
  service_price: z.number().min(0),
  currency: CurrencyCodeSchema.default('GBP'),
  duration_minutes: z.number().int().min(1).optional(),
  customer_notes: z.string().max(1000).optional(),
});

// ─── Recurring Pattern ─────────────────────────────────────────────────────────

export const RecurringPatternSchema = z.object({
  recurrence_pattern: z.enum(['daily', 'weekly', 'monthly']),
  recurrence_end_date: z.string().datetime().optional(),
  number_of_occurrences: z.number().int().min(1).max(52).optional(),
});

// ─── Booking Selection (date + optional recurring) ─────────────────────────────

export const BookingSelectionSchema = BookingDateSchema.extend({
  recurring: RecurringPatternSchema.optional(),
});

// ─── Guest Checkout ────────────────────────────────────────────────────────────

export const GuestCheckoutSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid international phone number'),
  notes: z.string().max(1000).optional(),
  service_address: LocationSchema.optional(),
  agreed_to_terms: z.literal(true, {
    error: 'You must agree to the terms of service',
  }),
  email_opt_in: z.boolean().default(false),
});

// ─── Create Booking ────────────────────────────────────────────────────────────

export const CreateBookingSchema = z.object({
  listing_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  match_id: z.string().uuid().optional(),

  // Schedule
  scheduled_date: z.string().datetime(),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/),
  duration_minutes: z.number().int().min(1).optional(),
  service_name: z.string().min(1),

  // Payment
  service_price: z.number().min(0),
  deposit_amount: z.number().min(0).optional(),
  currency: CurrencyCodeSchema.default('GBP'),

  // Location
  location: LocationSchema.optional(),

  // Notes
  customer_notes: z.string().max(1000).optional(),

  // Recurring
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.string().optional(),
  recurrence_end_date: z.string().datetime().optional(),
});

// ─── Update Booking ────────────────────────────────────────────────────────────

export const UpdateBookingSchema = z.object({
  status: BookingStatusSchema.optional(),
  scheduled_date: z.string().datetime().optional(),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  duration_minutes: z.number().int().min(1).optional(),
  customer_notes: z.string().max(1000).nullable().optional(),
  provider_notes: z.string().max(1000).nullable().optional(),
  cancellation_reason: z.string().max(500).optional(),
});
