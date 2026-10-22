import { Video } from '../types';
import { formatISO8601Duration, formatViewCount } from '../utils/formatters';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// High-speed, high-uptime public Invidious instances with open CORS
const INVIDIOUS_INSTANCES = [
  'https://invidious.f5.si',
  'https://invidious.flokinet.to',
  'https://invidious.materialio.us',
  'https://iv.melmac.space',
  'https://invidious.projectsegfau.lt',
];

export const GENERAL_DEMO_YOUTUBE_VIDEOS: Video[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    description: 'The official video for Never Gonna Give You Up by Rick Astley. Remastered in 4K.',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    channelTitle: 'Rick Astley',
    publishedAt: '2009-10-25T06:57:33Z',
    duration: '3:33',
    viewCount: '1.5B views',
    category: 'Music',
  },
  {
    id: '0e3GPea1Tyg',
    title: 'MrBeast - $1 vs $1,000,000 Hotel Room!',
    description: 'We tested the most expensive hotel room in the world vs a $1 hotel room!',
    thumbnailUrl: 'https://img.youtube.com/vi/0e3GPea1Tyg/hqdefault.jpg',
    channelTitle: 'MrBeast',
    publishedAt: '2023-10-28T20:00:00Z',
    duration: '20:15',
    viewCount: '180M views',
    category: 'Entertainment',
  },
  {
    id: 'L_LUpnjgPso',
    title: '10 Incredible Places to Visit in Japan | Travel Guide 2024',
    description: 'Explore Tokyo, Kyoto, Osaka, Mount Fuji, and hidden gems across Japan in this ultimate travel vlog.',
    thumbnailUrl: 'https://img.youtube.com/vi/L_LUpnjgPso/hqdefault.jpg',
    channelTitle: 'Travel Thru Life',
    publishedAt: '2024-02-14T12:00:00Z',
    duration: '18:45',
    viewCount: '2.3M views',
    category: 'Travel & Vlogs',
  },
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Queen - Bohemian Rhapsody (Official Video Remastered)',
    description: 'Welcome to the official Queen Channel. Revisit the legendary classic track Bohemian Rhapsody.',
    thumbnailUrl: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    channelTitle: 'Queen Official',
    publishedAt: '2008-11-23T19:00:00Z',
    duration: '5:59',
    viewCount: '1.7B views',
    category: 'Music',
  },
  {
    id: 'k3Vfj-e1Ma4',
    title: '10-Minute Authentic Italian Pasta Carbonara Recipe',
    description: 'Learn how to make traditional Roman Pasta Carbonara with egg yolks, guanciale, and Pecorino Romano.',
    thumbnailUrl: 'https://img.youtube.com/vi/k3Vfj-e1Ma4/hqdefault.jpg',
    channelTitle: 'Chef Antonio Kitchen',
    publishedAt: '2024-01-05T15:30:00Z',
    duration: '10:22',
    viewCount: '890K views',
    category: 'Cooking & Food',
  },
  {
    id: 'bMknfKXIFA8',
    title: 'Top 10 FIFA World Cup Goals of All Time',
    description: 'Relive the most breathtaking goals in World Cup football history featuring legendary strikes.',
    thumbnailUrl: 'https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg',
    channelTitle: 'FIFA Highlights',
    publishedAt: '2023-06-18T10:00:00Z',
    duration: '14:10',
    viewCount: '12M views',
    category: 'Sports',
  },
  {
    id: 'SqcY0GlETPk',
    title: 'Minecraft Hardcore 100 Days Survival Challenge',
    description: 'I survived 100 Days in Minecraft Hardcore mode and built a massive kingdom from scratch!',
    thumbnailUrl: 'https://img.youtube.com/vi/SqcY0GlETPk/hqdefault.jpg',
    channelTitle: 'GamerRealm',
    publishedAt: '2023-11-12T16:00:00Z',
    duration: '42:15',
    viewCount: '8.5M views',
    category: 'Gaming',
  },
  {
    id: 'W6NZfCO5SIk',
    title: 'MKBHD - iPhone 16 Pro Review: The Real Story!',
    description: 'Comprehensive hands-on review of camera improvements, battery life, and iOS performance on iPhone 16 Pro.',
    thumbnailUrl: 'https://img.youtube.com/vi/W6NZfCO5SIk/hqdefault.jpg',
    channelTitle: 'Marques Brownlee',
    publishedAt: '2024-03-10T17:00:00Z',
    duration: '17:35',
    viewCount: '5.2M views',
    category: 'Technology',
  },
];

function formatDurationSeconds(seconds?: number): string {
  if (!seconds || isNaN(seconds)) return '10:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${m}:${pad(s)}`;
}

export class YouTubeService {
  private static STORAGE_KEY = '@saddutube_youtube_api_key';

  static getApiKey(): string | undefined {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored && stored.trim()) return stored.trim();
      if ((window as any).__YOUTUBE_API_KEY__) return (window as any).__YOUTUBE_API_KEY__;
    }
    return (import.meta as any).env?.VITE_YOUTUBE_API_KEY || undefined;
  }

  static setCustomApiKey(key: string): void {
    if (typeof window !== 'undefined') {
      if (key && key.trim()) {
        localStorage.setItem(this.STORAGE_KEY, key.trim());
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  static isApiKeyConfigured(): boolean {
    const key = this.getApiKey();
    return !!key && key.trim().length > 0 && key !== 'YOUR_YOUTUBE_API_KEY_HERE';
  }

  /**
   * Fetch popular / trending videos:
   * 1. Official YouTube API (if key is set)
   * 2. High-speed parallel race across public Invidious instances (Region IN)
   * 3. Fallback dataset
   */
  static async getPopularVideos(maxResults = 16): Promise<Video[]> {
    const apiKey = this.getApiKey();

    // 1. Official API Key if provided
    if (this.isApiKeyConfigured() && apiKey) {
      try {
        const url = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=${maxResults}&regionCode=IN&key=${apiKey}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            return data.items.map((item: any) => ({
              id: item.id,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
              channelTitle: item.snippet.channelTitle,
              publishedAt: item.snippet.publishedAt,
              duration: formatISO8601Duration(item.contentDetails?.duration),
              viewCount: formatViewCount(item.statistics?.viewCount),
              category: item.snippet.categoryTitle || 'Trending',
            }));
          }
        }
      } catch (err) {
        console.warn('Official YouTube API popular fetch error, trying live public instances:', err);
      }
    }

    // 2. Query live public instances with fast parallel race for real-time trending videos
    const liveTrending = await this.getPopularFromLiveInstances(maxResults);
    if (liveTrending.length > 0) {
      return liveTrending;
    }

    // 3. Fallback dataset
    return GENERAL_DEMO_YOUTUBE_VIDEOS;
  }

  /**
   * Search YouTube for ANY user query:
   * 1. Official YouTube API (if key is set)
   * 2. High-speed parallel race across public live instances
   * 3. Dynamic results fallback
   */
  static async searchVideos(query: string, maxResults = 20): Promise<Video[]> {
    const trimmed = query.trim();
    if (!trimmed) return this.getPopularVideos(maxResults);

    const apiKey = this.getApiKey();

    // 1. Official YouTube API if key provided
    if (this.isApiKeyConfigured() && apiKey) {
      try {
        const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(
          trimmed
        )}&key=${apiKey}`;

        const response = await fetch(searchUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const videoIds = data.items.map((item: any) => item.id.videoId).filter(Boolean).join(',');
            const detailsMap = await this.getVideoDetailsMap(videoIds, apiKey);

            return data.items.map((item: any) => {
              const vId = item.id.videoId;
              const details = detailsMap[vId] || {};
              return {
                id: vId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${vId}/hqdefault.jpg`,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                duration: details.duration ? formatISO8601Duration(details.duration) : '10:00',
                viewCount: details.viewCount ? formatViewCount(details.viewCount) : 'Views unavailable',
              };
            });
          }
        }
      } catch (err) {
        console.warn('Official YouTube API search error, trying live public instances:', err);
      }
    }

    // 2. Query Live Public Invidious Engine with parallel race for 100% REAL YouTube search results
    const liveResults = await this.searchFromLiveInstances(trimmed, maxResults);
    if (liveResults.length > 0) {
      return liveResults;
    }

    // 3. Fallback matching
    return this.getFallbackSearchResults(trimmed);
  }

  static async getVideoById(videoId: string): Promise<Video> {
    const apiKey = this.getApiKey();

    // 1. Official YouTube API if key set
    if (this.isApiKeyConfigured() && apiKey) {
      try {
        const url = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const item = data.items[0];
            return {
              id: item.id,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              channelTitle: item.snippet.channelTitle,
              publishedAt: item.snippet.publishedAt,
              duration: formatISO8601Duration(item.contentDetails?.duration),
              viewCount: formatViewCount(item.statistics?.viewCount),
            };
          }
        }
      } catch {}
    }

    // 2. Live Public Instance details with parallel race
    const promises = INVIDIOUS_INSTANCES.slice(0, 3).map(async (inst) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      try {
        const res = await fetch(`${inst}/api/v1/videos/${videoId}`, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error('Not ok');
        const item = await res.json();
        if (item && item.title) {
          return {
            id: videoId,
            title: item.title,
            description: item.description || '',
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            channelTitle: item.author || 'YouTube Creator',
            publishedAt: item.publishedText || (item.published ? new Date(item.published * 1000).toISOString() : new Date().toISOString()),
            duration: formatDurationSeconds(item.lengthSeconds),
            viewCount: item.viewCountText || formatViewCount(item.viewCount),
          };
        }
        throw new Error('Invalid item');
      } catch (e) {
        clearTimeout(timeout);
        throw e;
      }
    });

    try {
      const video = await Promise.any(promises);
      if (video) return video;
    } catch {}

    const localMatch = GENERAL_DEMO_YOUTUBE_VIDEOS.find((v) => v.id === videoId);
    if (localMatch) return localMatch;

    return {
      id: videoId,
      title: `YouTube Video (${videoId})`,
      description: 'Streamed via official YouTube player in SadduTube.',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      channelTitle: 'YouTube Creator',
      publishedAt: new Date().toISOString(),
      duration: '10:00',
      viewCount: '100K views',
    };
  }

  private static async searchFromLiveInstances(query: string, maxResults = 20): Promise<Video[]> {
    const promises = INVIDIOUS_INSTANCES.map(async (instance) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      try {
        const url = `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const videos = data
            .filter((item: any) => item.type === 'video' || (item.videoId && item.title))
            .slice(0, maxResults)
            .map((item: any) => ({
              id: item.videoId,
              title: item.title,
              description: item.description || '',
              thumbnailUrl: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
              channelTitle: item.author || 'YouTube Creator',
              publishedAt: item.publishedText || (item.published ? new Date(item.published * 1000).toISOString() : new Date().toISOString()),
              duration: formatDurationSeconds(item.lengthSeconds),
              viewCount: item.viewCountText || formatViewCount(item.viewCount),
              category: 'YouTube Video',
            }));

          if (videos.length > 0) return videos;
        }
        throw new Error('No valid videos found');
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    });

    try {
      return await Promise.any(promises);
    } catch {
      return [];
    }
  }

  private static async getPopularFromLiveInstances(maxResults = 16): Promise<Video[]> {
    const promises = INVIDIOUS_INSTANCES.map(async (instance) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      try {
        const url = `${instance}/api/v1/trending?region=IN`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const videos = data
            .filter((item: any) => item.videoId && item.title)
            .slice(0, maxResults)
            .map((item: any) => ({
              id: item.videoId,
              title: item.title,
              description: item.description || '',
              thumbnailUrl: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
              channelTitle: item.author || 'YouTube Creator',
              publishedAt: item.publishedText || (item.published ? new Date(item.published * 1000).toISOString() : new Date().toISOString()),
              duration: formatDurationSeconds(item.lengthSeconds),
              viewCount: item.viewCountText || formatViewCount(item.viewCount),
              category: 'Trending',
            }));

          if (videos.length > 0) return videos;
        }
        throw new Error('No trending items found');
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    });

    try {
      return await Promise.any(promises);
    } catch {
      return [];
    }
  }

  private static async getVideoDetailsMap(
    videoIds: string,
    apiKey: string
  ): Promise<Record<string, { duration?: string; viewCount?: string }>> {
    const map: Record<string, { duration?: string; viewCount?: string }> = {};
    if (!videoIds) return map;

    try {
      const url = `${YOUTUBE_API_BASE}/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) return map;
      const data = await response.json();

      if (data.items) {
        data.items.forEach((item: any) => {
          map[item.id] = {
            duration: item.contentDetails?.duration,
            viewCount: item.statistics?.viewCount,
          };
        });
      }
    } catch {
      // ignore
    }
    return map;
  }

  private static getFallbackSearchResults(query: string): Video[] {
    const q = query.toLowerCase().trim();
    if (!q) return GENERAL_DEMO_YOUTUBE_VIDEOS;

    const filtered = GENERAL_DEMO_YOUTUBE_VIDEOS.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.channelTitle.toLowerCase().includes(q)
    );

    if (filtered.length > 0) return filtered;

    // Fallback: If no match and offline, generate search result card matching user query
    return [
      {
        id: 'dQw4w9WgXcQ',
        title: `YouTube result for "${query}"`,
        description: `Watch videos matching "${query}" on SadduTube`,
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        channelTitle: 'YouTube Creator',
        publishedAt: new Date().toISOString(),
        duration: '12:30',
        viewCount: '1M views',
        category: 'Search Result',
      },
    ];
  }
}
