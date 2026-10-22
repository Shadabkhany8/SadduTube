/**
 * Format view count numbers into human readable string (e.g. 1.4M views, 350K views)
 */
export function formatViewCount(views?: string | number): string {
  if (views === undefined || views === null || views === '') return '0 views';
  const num = typeof views === 'string' ? parseInt(views, 10) : views;
  if (isNaN(num)) return `${views} views`;

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B views`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M views`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K views`;
  }
  return `${num} views`;
}

/**
 * Format ISO 8601 duration string (e.g., PT15M33S, PT1H2M5S) to mm:ss or hh:mm:ss format
 */
export function formatISO8601Duration(isoDuration?: string): string {
  if (!isoDuration) return '10:00';
  if (isoDuration.includes(':')) return isoDuration; // already formatted

  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoDuration.match(regex);
  if (!matches) return isoDuration;

  const hours = matches[1] ? parseInt(matches[1], 10) : 0;
  const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
  const seconds = matches[3] ? parseInt(matches[3], 10) : 0;

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}

/**
 * Format timestamp / date string to relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 60) return 'Just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y ago`;
}
