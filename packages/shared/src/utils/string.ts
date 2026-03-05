// ─── Slugify ───────────────────────────────────────────────────────────────────

/**
 * Convert a string to a URL-safe slug.
 * "Hello World! (2024)" → "hello-world-2024"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Truncate ──────────────────────────────────────────────────────────────────

/** Truncate a string with an ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trimEnd() + '…';
}

// ─── Capitalize ────────────────────────────────────────────────────────────────

/** Capitalize the first letter of a string */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Title case: capitalize each word */
export function titleCase(text: string): string {
  return text.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Initials ──────────────────────────────────────────────────────────────────

/** Extract initials from a name (e.g., "John Doe" → "JD") */
export function getInitials(name: string, max = 2): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, max)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

// ─── Sanitize ──────────────────────────────────────────────────────────────────

/** Strip HTML tags from a string */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/** Basic string sanitization — trim and collapse whitespace */
export function sanitizeString(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

// ─── Pluralize ─────────────────────────────────────────────────────────────────

/** Simple English pluralization */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

// ─── Number Formatting ─────────────────────────────────────────────────────────

/** Compact number display (e.g., 1500 → "1.5K", 2_000_000 → "2M") */
export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toString();
}
