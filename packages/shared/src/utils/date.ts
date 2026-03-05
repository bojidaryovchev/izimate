// ─── Relative Time ─────────────────────────────────────────────────────────────

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;
const WEEK = 604_800_000;
const MONTH = 2_592_000_000; // ~30 days
const YEAR = 31_536_000_000; // ~365 days

/**
 * Format a date as a relative time string (e.g., "2 hours ago").
 * Works isomorphically — no Intl.RelativeTimeFormat needed.
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = Date.now();
  const diff = now - d.getTime();

  if (diff < 0) return 'just now';
  if (diff < MINUTE) return 'just now';
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return mins === 1 ? '1 minute ago' : `${mins} minutes ago`;
  }
  if (diff < DAY) {
    const hrs = Math.floor(diff / HOUR);
    return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
  }
  if (diff < WEEK) {
    const days = Math.floor(diff / DAY);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  if (diff < MONTH) {
    const weeks = Math.floor(diff / WEEK);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diff / YEAR);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

// ─── Date Formatters ───────────────────────────────────────────────────────────

/** Format: "Jan 15, 2025" */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format: "Wednesday, January 15, 2025" */
export function formatDateFull(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format: "2:30 PM" */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Format: "Jan 15, 2025 at 2:30 PM" */
export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/** Format a date range: "Jan 15 – Jan 20, 2025" */
export function formatDateRange(start: string | Date, end: string | Date): string {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;

  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    // Same month + year
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { day: 'numeric' })}, ${e.getFullYear()}`;
  }
  return `${formatDate(s)} – ${formatDate(e)}`;
}

/** Format a time range: "2:00 PM – 4:00 PM" */
export function formatTimeRange(start: string | Date, end: string | Date): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** Check if a date is in the past */
export function isPast(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < Date.now();
}

/** Check if a date is today */
export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}
