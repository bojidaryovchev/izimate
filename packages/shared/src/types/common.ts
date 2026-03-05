// ─── Shared / Common Types ─────────────────────────────────────────────────────

/** ISO-8601 date-time string */
export type ISODateTime = string;

/** UUID string */
export type UUID = string;

/** Geographic coordinates */
export interface GeoLocation {
  latitude: number;
  longitude: number;
}

/** Address with coordinates */
export interface Location {
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
}

/** Pagination cursor-based request */
export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

/** Pagination offset-based request */
export interface OffsetPaginationParams {
  page?: number;
  per_page?: number;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  cursor: string | null;
  has_more: boolean;
  total?: number;
}

/** Standard API error shape */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/** Standard API success response */
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

/** Timestamps mixin */
export interface Timestamps {
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

/** Soft-delete mixin */
export interface SoftDeletable {
  deleted_at: ISODateTime | null;
}

/** Price list item (for price_list budget type) */
export interface PriceListItem {
  name: string;
  price: number;
  description?: string;
}

/** Supported currency code */
export type CurrencyCode =
  | 'USD'
  | 'GBP'
  | 'EUR'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'CHF'
  | 'CNY'
  | 'INR'
  | 'BRL'
  | 'MXN'
  | 'ZAR'
  | 'NZD'
  | 'SGD'
  | 'HKD'
  | 'NOK'
  | 'SEK'
  | 'DKK'
  | 'PLN'
  | 'CZK'
  | 'AED';

/** Currency metadata */
export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  decimals: number;
}
