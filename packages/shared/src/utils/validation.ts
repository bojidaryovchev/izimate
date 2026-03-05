// ─── Validation Utilities ──────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[1-9]\d{1,14}$/;
const URL_RE = /^https?:\/\/.+/;

/** Validate an email address */
export function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** Validate an international phone number (E.164 format) */
export function validatePhone(phone: string): boolean {
  return PHONE_RE.test(phone.trim());
}

/** Validate a URL */
export function validateUrl(url: string): boolean {
  return URL_RE.test(url.trim());
}

/** Validate listing title length */
export function validateListingTitle(title: string): { valid: boolean; error?: string } {
  const trimmed = title.trim();
  if (trimmed.length < 3) return { valid: false, error: 'Title must be at least 3 characters' };
  if (trimmed.length > 100) return { valid: false, error: 'Title must be 100 characters or less' };
  return { valid: true };
}

/** Validate listing description length */
export function validateListingDescription(desc: string): { valid: boolean; error?: string } {
  const trimmed = desc.trim();
  if (trimmed.length < 10) return { valid: false, error: 'Description must be at least 10 characters' };
  if (trimmed.length > 2000) return { valid: false, error: 'Description must be 2000 characters or less' };
  return { valid: true };
}

/** Validate a price range (min < max, both ≥ 0) */
export function validatePriceRange(min: number, max: number): { valid: boolean; error?: string } {
  if (min < 0 || max < 0) return { valid: false, error: 'Prices must be non-negative' };
  if (min > max) return { valid: false, error: 'Minimum price must be less than maximum' };
  return { valid: true };
}

/** Validate a rating (1–5) */
export function validateRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

/** Check password strength */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('At least 8 characters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('At least one uppercase letter');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('At least one lowercase letter');

  if (/\d/.test(password)) score++;
  else feedback.push('At least one number');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('At least one special character');

  return { valid: score >= 4, score, feedback };
}
