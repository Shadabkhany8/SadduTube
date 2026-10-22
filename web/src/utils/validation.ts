/**
 * Extracts standard 11-character YouTube Video ID from full URLs or raw input strings
 */
export function extractYouTubeVideoId(urlOrId: string): string | null {
  if (!urlOrId) return null;

  const trimmed = urlOrId.trim();

  // If it's already an 11-character string containing alphanumeric, underscore, hyphen
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex patterns for standard youtube.com and youtu.be links
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
    if (match && match[2] && match[2].length === 11) {
      return match[2];
    }
  }

  return null;
}

/**
 * Validates whether a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  try {
    const cleanUrl = url.trim().toLowerCase();
    return (
      cleanUrl.includes('youtube.com') ||
      cleanUrl.includes('youtu.be') ||
      cleanUrl.startsWith('https://www.youtube.com') ||
      cleanUrl.startsWith('https://m.youtube.com') ||
      cleanUrl.startsWith('https://youtube.com') ||
      extractYouTubeVideoId(cleanUrl) !== null
    );
  } catch {
    return false;
  }
}

/**
 * Generates high quality YouTube thumbnail URL from video ID if available
 */
export function getYouTubeThumbnailUrl(videoId?: string | null): string | undefined {
  if (!videoId) return undefined;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Builds standard YouTube video watch URL
 */
export function buildYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Builds standard YouTube video embed URL
 */
export function buildYouTubeEmbedUrl(videoId: string, autoplay = true): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&playsinline=1&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1`;
}

/**
 * Clean and normalize a YouTube URL
 */
export function normalizeYouTubeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return 'https://www.youtube.com';

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      return `https://${trimmed}`;
    }
    // Search query fallback
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}

/**
 * Clean YouTube document titles (removes " - YouTube")
 */
export function cleanYouTubeTitle(rawTitle?: string): string {
  if (!rawTitle) return 'YouTube';
  return rawTitle.replace(/\s*-\s*YouTube$/i, '').trim() || 'YouTube';
}
