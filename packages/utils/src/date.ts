/**
 * Format a date to Turkish locale string
 */
export function formatDate(date: Date | string | number): string {
  const dateObj = typeof date === 'object' ? date : new Date(date);
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
}

/**
 * Format a date to short format (DD.MM.YYYY)
 */
export function formatDateShort(date: Date | string | number): string {
  const dateObj = typeof date === 'object' ? date : new Date(date);
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string | number): string {
  const dateObj = typeof date === 'object' ? date : new Date(date);
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string | number): string {
  const dateObj = typeof date === 'object' ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} gün önce`;
  if (diffHours > 0) return `${diffHours} saat önce`;
  if (diffMins > 0) return `${diffMins} dakika önce`;
  return 'Az önce';
}
