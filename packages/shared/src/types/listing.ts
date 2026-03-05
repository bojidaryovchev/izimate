import type {
  UUID,
  ISODateTime,
  Timestamps,
  Location,
  CurrencyCode,
  PriceListItem,
} from './common';
import type {
  ListingType,
  ListingRole,
  ListingStatus,
  BudgetType,
  Urgency,
  PromotionType,
  AuctionStatus,
  RaffleStatus,
  BookFormat,
  FreelanceCategory,
  SpaceType,
  FundraisingCategory,
  DeliveryType,
  TaxiVehicleType,
  RentalDurationType,
  TransportPricingModel,
  GatedContentType,
  AccessLevel,
} from './enums';

// ─── Listing (polymorphic mega-entity) ─────────────────────────────────────────

export interface Listing extends Timestamps {
  id: UUID;
  user_id: UUID;

  // Core
  title: string;
  description: string;
  listing_type: ListingType;
  listing_role: ListingRole;
  category: string;
  subcategory: string | null;
  tags: string[];
  status: ListingStatus;

  // Budget / pricing
  budget_type: BudgetType;
  budget_min: number | null;
  budget_max: number | null;
  fixed_price: number | null;
  hourly_rate: number | null;
  price_list: PriceListItem[] | null;
  currency: CurrencyCode;

  // Location
  location: Location | null;
  is_remote: boolean;
  service_radius_km: number | null;

  // Media
  photos: string[];
  video_url: string | null;

  // Scheduling
  urgency: Urgency | null;
  available_from: ISODateTime | null;
  available_until: ISODateTime | null;

  // Engagement counters
  views_count: number;
  likes_count: number;
  swipes_count: number;
  matches_count: number;

  // Promotion
  is_promoted: boolean;
  promotion_type: PromotionType | null;
  promotion_expires_at: ISODateTime | null;

  // ─── Type-specific: Goods ──────────────────────────────────────────────────
  condition: string | null;
  brand: string | null;
  shipping_available: boolean | null;
  shipping_cost: number | null;

  // ─── Type-specific: Book ───────────────────────────────────────────────────
  book_author: string | null;
  book_isbn: string | null;
  book_format: BookFormat | null;
  book_page_count: number | null;

  // ─── Type-specific: Digital / Gated Content ────────────────────────────────
  content_url: string | null;
  content_type: GatedContentType | null;
  access_level: AccessLevel | null;
  preview_url: string | null;
  subscriber_count: number | null;

  // ─── Type-specific: Rental ─────────────────────────────────────────────────
  rental_duration_type: RentalDurationType | null;
  rental_deposit: number | null;
  rental_rules: string | null;

  // ─── Type-specific: Experience ─────────────────────────────────────────────
  experience_duration_minutes: number | null;
  max_participants: number | null;
  includes: string[] | null;
  requirements: string[] | null;

  // ─── Type-specific: Freelance / UGC ────────────────────────────────────────
  freelance_category: FreelanceCategory | null;
  turnaround_days: number | null;
  revisions_included: number | null;
  deliverables: string[] | null;

  // ─── Type-specific: Auction ────────────────────────────────────────────────
  auction_status: AuctionStatus | null;
  auction_start_price: number | null;
  auction_reserve_price: number | null;
  auction_current_bid: number | null;
  auction_bid_count: number | null;
  auction_starts_at: ISODateTime | null;
  auction_ends_at: ISODateTime | null;

  // ─── Type-specific: Raffle / Lottery ───────────────────────────────────────
  raffle_status: RaffleStatus | null;
  raffle_ticket_price: number | null;
  raffle_max_tickets: number | null;
  raffle_tickets_sold: number | null;
  raffle_prize_description: string | null;
  raffle_draw_date: ISODateTime | null;

  // ─── Type-specific: Space Sharing ──────────────────────────────────────────
  space_type: SpaceType | null;
  space_size_sqm: number | null;
  space_amenities: string[] | null;

  // ─── Type-specific: Fundraising ────────────────────────────────────────────
  fundraising_category: FundraisingCategory | null;
  fundraising_goal: number | null;
  fundraising_raised: number | null;
  fundraising_donor_count: number | null;
  fundraising_deadline: ISODateTime | null;

  // ─── Type-specific: Transportation ─────────────────────────────────────────
  transport_pricing_model: TransportPricingModel | null;
  transport_vehicle_type: string | null;

  // ─── Type-specific: Delivery ───────────────────────────────────────────────
  delivery_type: DeliveryType | null;
  delivery_radius_km: number | null;
  estimated_delivery_minutes: number | null;

  // ─── Type-specific: Taxi / Rideshare ───────────────────────────────────────
  taxi_vehicle_type: TaxiVehicleType | null;
  taxi_max_passengers: number | null;

  // ─── Type-specific: Subscription ───────────────────────────────────────────
  subscription_price_monthly: number | null;
  subscription_price_yearly: number | null;
  subscription_features: string[] | null;
}
