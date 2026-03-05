import type { UUID, Timestamps, CurrencyCode } from './common';
import type {
  DonationStatus,
  RecurringFrequency,
  TicketPaymentStatus,
} from './enums';

// ─── Donation ──────────────────────────────────────────────────────────────────

export interface Donation extends Timestamps {
  id: UUID;
  listing_id: UUID;
  donor_id: UUID;
  amount: number;
  currency: CurrencyCode;
  status: DonationStatus;
  is_anonymous: boolean;
  recurring: boolean;
  recurring_frequency: RecurringFrequency | null;
  dedicated_to: string | null;
  payment_intent_id: string | null;
  platform_fee: number | null;
  net_amount: number | null;
}

// ─── Auction Bid ───────────────────────────────────────────────────────────────

export interface AuctionBid extends Timestamps {
  id: UUID;
  listing_id: UUID;
  bidder_id: UUID;
  amount: number;
  currency: CurrencyCode;
  is_winner: boolean | null;
}

// ─── Raffle Ticket ─────────────────────────────────────────────────────────────

export interface RaffleTicket extends Timestamps {
  id: UUID;
  listing_id: UUID;
  buyer_id: UUID;
  quantity: number;
  total_amount: number;
  currency: CurrencyCode;
  ticket_numbers: number[] | null;
  payment_status: TicketPaymentStatus;
  is_winner: boolean;
}
