import type { CurrencyCode, CurrencyInfo } from '../types';

// ─── Currency Registry ─────────────────────────────────────────────────────────

const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', decimals: 2 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', decimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', decimals: 0 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', decimals: 2 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', decimals: 2 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', decimals: 2 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷', decimals: 2 },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', flag: '🇲🇽', decimals: 2 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', decimals: 2 },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: '🇳🇿', decimals: 2 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', decimals: 2 },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: '🇭🇰', decimals: 2 },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴', decimals: 2 },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪', decimals: 2 },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰', decimals: 2 },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', flag: '🇵🇱', decimals: 2 },
  CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', flag: '🇨🇿', decimals: 2 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪', decimals: 2 },
};

// ─── Country → Currency Mapping ────────────────────────────────────────────────

const COUNTRY_CURRENCY_MAP: Record<string, CurrencyCode> = {
  // Full names
  'united states': 'USD', 'united kingdom': 'GBP', 'france': 'EUR', 'germany': 'EUR',
  'spain': 'EUR', 'italy': 'EUR', 'netherlands': 'EUR', 'belgium': 'EUR',
  'austria': 'EUR', 'ireland': 'EUR', 'portugal': 'EUR', 'finland': 'EUR',
  'greece': 'EUR', 'canada': 'CAD', 'australia': 'AUD', 'japan': 'JPY',
  'switzerland': 'CHF', 'china': 'CNY', 'india': 'INR', 'brazil': 'BRL',
  'mexico': 'MXN', 'south africa': 'ZAR', 'new zealand': 'NZD',
  'singapore': 'SGD', 'hong kong': 'HKD', 'norway': 'NOK', 'sweden': 'SEK',
  'denmark': 'DKK', 'poland': 'PLN', 'czech republic': 'CZK', 'czechia': 'CZK',
  'uae': 'AED', 'united arab emirates': 'AED',
  // ISO codes
  US: 'USD', GB: 'GBP', FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR',
  NL: 'EUR', BE: 'EUR', AT: 'EUR', IE: 'EUR', PT: 'EUR', FI: 'EUR',
  GR: 'EUR', CA: 'CAD', AU: 'AUD', JP: 'JPY', CH: 'CHF', CN: 'CNY',
  IN: 'INR', BR: 'BRL', MX: 'MXN', ZA: 'ZAR', NZ: 'NZD',
  SG: 'SGD', HK: 'HKD', NO: 'NOK', SE: 'SEK', DK: 'DKK',
  PL: 'PLN', CZ: 'CZK', AE: 'AED',
};

// ─── Public API ────────────────────────────────────────────────────────────────

/** Get full currency info by code */
export function getCurrency(code: CurrencyCode): CurrencyInfo {
  return CURRENCIES[code];
}

/** Get all supported currencies */
export function getAllCurrencies(): CurrencyInfo[] {
  return Object.values(CURRENCIES);
}

/** Look up currency code from country name or ISO code */
export function getCurrencyFromCountry(country: string): CurrencyCode | null {
  return COUNTRY_CURRENCY_MAP[country.toLowerCase()] ?? COUNTRY_CURRENCY_MAP[country.toUpperCase()] ?? null;
}

/** Resolve the user's currency with a fallback chain */
export function getUserCurrency(
  currency?: CurrencyCode | null,
  country?: string | null,
): CurrencyCode {
  if (currency && currency in CURRENCIES) return currency;
  if (country) {
    const fromCountry = getCurrencyFromCountry(country);
    if (fromCountry) return fromCountry;
  }
  return 'GBP';
}

/** Format a currency amount (e.g., "£12.50") */
export function formatCurrency(amount: number, code: CurrencyCode = 'GBP'): string {
  const info = CURRENCIES[code];
  if (!info) return `${amount}`;
  const formatted = amount.toFixed(info.decimals);
  return `${info.symbol}${formatted}`;
}

/** Format a currency range (e.g., "£10.00 – £50.00") */
export function formatCurrencyRange(
  min: number,
  max: number,
  code: CurrencyCode = 'GBP',
): string {
  return `${formatCurrency(min, code)} – ${formatCurrency(max, code)}`;
}
