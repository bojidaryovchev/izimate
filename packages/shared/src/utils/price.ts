import type { CurrencyCode, BudgetType } from '../types';
import { formatCurrency, formatCurrencyRange } from './currency';

// ─── Price Display Helpers ─────────────────────────────────────────────────────

/** Format a single price (e.g., "£25.00") */
export function formatPrice(amount: number, currency: CurrencyCode = 'GBP'): string {
  return formatCurrency(amount, currency);
}

/** Format a price range (e.g., "£10.00 – £50.00") */
export function formatPriceRange(
  min: number,
  max: number,
  currency: CurrencyCode = 'GBP',
): string {
  return formatCurrencyRange(min, max, currency);
}

/** Format a price based on budget type */
export function formatBudget(opts: {
  budget_type: BudgetType;
  fixed_price?: number | null;
  hourly_rate?: number | null;
  budget_min?: number | null;
  budget_max?: number | null;
  currency?: CurrencyCode;
}): string {
  const currency = opts.currency ?? 'GBP';

  switch (opts.budget_type) {
    case 'fixed':
      return opts.fixed_price != null ? formatCurrency(opts.fixed_price, currency) : 'Price TBD';
    case 'hourly':
      return opts.hourly_rate != null ? `${formatCurrency(opts.hourly_rate, currency)}/hr` : 'Rate TBD';
    case 'range':
      if (opts.budget_min != null && opts.budget_max != null) {
        return formatCurrencyRange(opts.budget_min, opts.budget_max, currency);
      }
      if (opts.budget_min != null) return `From ${formatCurrency(opts.budget_min, currency)}`;
      if (opts.budget_max != null) return `Up to ${formatCurrency(opts.budget_max, currency)}`;
      return 'Price TBD';
    case 'price_list':
      return 'See price list';
    case 'auction':
      return 'Auction';
    case 'lottery':
      return 'Lottery';
    default:
      return 'Price TBD';
  }
}

/** Format the display price for a listing, handling all listing types */
export function formatListingPrice(listing: {
  budget_type: BudgetType;
  fixed_price?: number | null;
  hourly_rate?: number | null;
  budget_min?: number | null;
  budget_max?: number | null;
  currency?: CurrencyCode;
  raffle_ticket_price?: number | null;
  auction_current_bid?: number | null;
  auction_start_price?: number | null;
  rental_duration_type?: string | null;
  subscription_price_monthly?: number | null;
}): string {
  const currency = listing.currency ?? 'GBP';

  // Special handling for auction
  if (listing.budget_type === 'auction') {
    if (listing.auction_current_bid != null) {
      return `Current bid: ${formatCurrency(listing.auction_current_bid, currency)}`;
    }
    if (listing.auction_start_price != null) {
      return `Starting at ${formatCurrency(listing.auction_start_price, currency)}`;
    }
    return 'Auction';
  }

  // Special handling for raffle
  if (listing.budget_type === 'lottery') {
    if (listing.raffle_ticket_price != null) {
      return `${formatCurrency(listing.raffle_ticket_price, currency)}/ticket`;
    }
    return 'Lottery';
  }

  // Rental with duration
  if (listing.rental_duration_type && listing.fixed_price != null) {
    return `${formatCurrency(listing.fixed_price, currency)}/${listing.rental_duration_type}`;
  }

  // Subscription
  if (listing.subscription_price_monthly != null) {
    return `${formatCurrency(listing.subscription_price_monthly, currency)}/mo`;
  }

  return formatBudget(listing);
}
