import { z } from 'zod';

// ─── Pagination ────────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export const OffsetPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(1).max(100).default(20),
});

// ─── Location ──────────────────────────────────────────────────────────────────

export const LocationSchema = z.object({
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  postal_code: z.string().nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
});

export const GeoLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// ─── Currency ──────────────────────────────────────────────────────────────────

export const CurrencyCodeSchema = z.enum([
  'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL',
  'MXN', 'ZAR', 'NZD', 'SGD', 'HKD', 'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'AED',
]);

// ─── Price List Item ───────────────────────────────────────────────────────────

export const PriceListItemSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().min(0),
  description: z.string().max(500).optional(),
});
