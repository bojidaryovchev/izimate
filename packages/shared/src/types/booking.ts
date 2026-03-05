import type { UUID, ISODateTime, Timestamps, Location, CurrencyCode } from './common';
import type { BookingStatus } from './enums';

// ─── Booking ───────────────────────────────────────────────────────────────────

export interface Booking extends Timestamps {
  id: UUID;
  match_id: UUID | null;
  listing_id: UUID;
  provider_id: UUID;
  customer_id: UUID | null;

  // Guest booking
  guest_booking: boolean;
  guest_customer_id: UUID | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;

  // Status
  status: BookingStatus;

  // Scheduling
  scheduled_date: ISODateTime | null;
  scheduled_time: string | null;
  duration_minutes: number | null;
  service_name: string | null;

  // Recurring
  is_recurring: boolean;
  recurrence_pattern: string | null;
  recurrence_end_date: ISODateTime | null;

  // Payment
  service_price: number | null;
  deposit_amount: number | null;
  total_amount: number | null;
  currency: CurrencyCode;
  payment_intent_id: string | null;
  payment_status: string | null;

  // Location
  location: Location | null;

  // Notes
  customer_notes: string | null;
  provider_notes: string | null;

  // Cal.com
  calcom_booking_uid: string | null;
  calcom_event_type_id: number | null;

  // Cancellation
  cancelled_by: UUID | null;
  cancellation_reason: string | null;
  cancelled_at: ISODateTime | null;
}
