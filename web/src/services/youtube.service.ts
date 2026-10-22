import { Video } from '../types';
import { formatISO8601Duration, formatViewCount, deduplicateVideos } from '../utils/formatters';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// High-speed, high-uptime public Invidious instances with open CORS
const INVIDIOUS_INSTANCES = [
  'https://invidious.flokinet.to',
  'https://invidious.f5.si',
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
   * Fetch popular / trending videos (10 items per batch for instant response and smooth thumbnails):
   */
  static async getPopularVideos(targetCount = 10, page = 1): Promise<Video[]> {
    const apiKey = this.getApiKey();

    // 1. Official API Key if provided
    if (this.isApiKeyConfigured() && apiKey) {
      try {
        const url = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=${Math.min(targetCount, 50)}&regionCode=IN&key=${apiKey}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            return data.items.map((item: any) => ({
              id: item.id,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnailUrl: `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
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

    // 2. Query live public instances for real-time trending videos
    const liveTrending = await this.getPopularFromLiveInstances(targetCount, page);
    if (liveTrending.length > 0) {
      return liveTrending;
    }

    // 3. Fallback dataset
    return GENERAL_DEMO_YOUTUBE_VIDEOS.slice(0, targetCount);
  }

  /**
   * Search YouTube for ANY user query (10 items per batch for fast, smooth pagination):
   */
  static async searchVideos(query: string, targetCount = 10, page = 1): Promise<Video[]> {
    const trimmed = query.trim();
    if (!trimmed) return this.getPopularVideos(targetCount, page);

    const apiKey = this.getApiKey();

    // 1. Official YouTube API if key provided
    if (this.isApiKeyConfigured() && apiKey) {
      try {
        const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=video&maxResults=${Math.min(targetCount, 50)}&q=${encodeURIComponent(
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
                thumbnailUrl: `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
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

    // 2. Query Live Public Invidious Engine with 10-item pagination
    const liveResults = await this.searchFromLiveInstances(trimmed, targetCount, page);
    if (liveResults.length > 0) {
      return liveResults;
    }

    // 3. Fallback matching
    return this.getFallbackSearchResults(trimmed);
  }

  /**
   * Helper to clean up video/song title and extract targeted search keywords.
   * Handles Bollywood, Punjabi, Pop, and general songs intelligently.
   */
  static extractRelatedKeywords(title: string, author?: string): string {
    if (!title) return author && author !== 'YouTube Creator' ? `${author} songs` : 'bollywood trending songs';

    // If title is generic fallback
    if (/^youtube video \(/i.test(title)) {
      return author && author !== 'YouTube Creator' ? `${author} songs` : 'bollywood trending songs';
    }

    // Strip out common music video metadata noise
    const clean = title
      .replace(/\s*\(?(official|music video|full video|audio|remastered|lyric video|lyrics|4k|hd|visualizer|video song|song)\)?\s*/gi, ' ')
      .replace(/\[[^\]]*\]/g, ' ')
      .replace(/\([^)]*\)/g, ' ')
      .trim();

    // Check for title dividers like "|", "-", ":", "—"
    const parts = clean.split(/[|:—–-]/).map((p) => p.trim()).filter((p) => p.length > 1);

    if (parts.length >= 2) {
      // Typically part 0 is Song Name, part 1 is Movie or Main Artist (e.g. "Tauba Tauba" + "Bad Newz")
      const combined = `${parts[0]} ${parts[1]}`.replace(/\s+/g, ' ').trim();
      if (combined.length > 3) return combined;
      return parts[0];
    } else if (parts.length === 1 && parts[0].length > 2) {
      const single = parts[0].replace(/\s+/g, ' ').trim();
      if (author && author !== 'YouTube Creator' && !single.toLowerCase().includes(author.toLowerCase())) {
        return `${single} ${author}`;
      }
      return single;
    }

    return author && author !== 'YouTube Creator' ? `${author} songs` : clean;
  }

  /**
   * Separate Dedicated Engine for Related Songs / Videos when a video is playing (10 items per batch):
   * Extracts clean keywords and fetches recommendations strictly related to the current playing track.
   */
  static async getRelatedVideos(
    video: { id?: string; title: string; channelTitle?: string },
    targetCount = 10,
    page = 1
  ): Promise<Video[]> {
    if (!video || !video.title) return [];

    const primaryQuery = this.extractRelatedKeywords(video.title, video.channelTitle);
    const author = (video.channelTitle || '').trim();

    // 1. Try targeted search using extracted keywords (e.g. "Tauba Tauba Bad Newz")
    try {
      const results = await this.searchVideos(primaryQuery, targetCount, page);
      const filtered = results.filter((v) => v.id !== video.id);
      if (filtered.length > 0) return filtered;
    } catch (e) {
      console.warn('Failed to load related videos with primary query:', primaryQuery, e);
    }

    // 2. Try artist / channel query if primary returned few results
    if (author && author !== 'YouTube Creator') {
      try {
        const authorQuery = `${author} songs`;
        const authorResults = await this.searchVideos(authorQuery, targetCount, page);
        const filtered = authorResults.filter((v) => v.id !== video.id);
        if (filtered.length > 0) return filtered;
      } catch {}
    }

    // 3. Fallback to general music/popular if search produced nothing
    return (await this.getPopularVideos(targetCount, page)).filter((v) => v.id !== video.id);
  }

  /**
   * Personalized Recommendations for Home Feed based on User's Watch History (10 items per batch):
   * Extracts keywords from recent videos and surfaces content matching the user's taste.
   */
  static async getHistoryRecommendations(
    historyItems: { videoId?: string; title: string; channelTitle?: string }[],
    targetCount = 10,
    page = 1
  ): Promise<Video[]> {
    // Filter to items that have real titles
    const validItems = (historyItems || []).filter(
      (h) => h && h.title && h.title !== 'YouTube' && !h.title.startsWith('YouTube Video (')
    );

    if (validItems.length === 0) {
      // No meaningful history yet - fallback to popular videos
      return this.getPopularVideos(targetCount, page);
    }

    // Gather unique queries from the most recent watched videos (up to top 5)
    const queries: string[] = [];
    const seenQueries = new Set<string>();

    for (const item of validItems.slice(0, 5)) {
      const q = this.extractRelatedKeywords(item.title, item.channelTitle);
      if (q && !seenQueries.has(q.toLowerCase())) {
        seenQueries.add(q.toLowerCase());
        queries.push(q);
      }
    }

    if (queries.length === 0) {
      return this.getPopularVideos(targetCount, page);
    }

    // Select query based on page (interleave across watched tracks as user scrolls)
    const queryIndex = (page - 1) % queries.length;
    const currentQuery = queries[queryIndex];
    const subPage = Math.floor((page - 1) / queries.length) + 1;

    try {
      const results = await this.searchVideos(currentQuery, targetCount, subPage);
      const watchedIds = new Set(historyItems.map((h) => h.videoId).filter(Boolean));
      const filtered = results.filter((v) => !watchedIds.has(v.id));

      if (filtered.length >= 6) {
        return filtered.slice(0, targetCount);
      }

      // If fewer than 6, blend with next query in the list
      if (queries.length > 1) {
        const nextQuery = queries[(queryIndex + 1) % queries.length];
        const nextResults = await this.searchVideos(nextQuery, targetCount, subPage);
        const blended = deduplicateVideos(filtered, nextResults.filter((v) => !watchedIds.has(v.id)));
        if (blended.length > 0) {
          return blended.slice(0, targetCount);
        }
      }

      if (filtered.length > 0) return filtered;
    } catch (err) {
      console.warn('Failed to load history-based recommendations:', err);
    }

    return this.getPopularVideos(targetCount, page);
  }

  static async getVideoById(videoId: string): Promise<Video> {
    const apiKey = this.getApiKey();

    // 1. Official YouTube API if key configured
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
              thumbnailUrl:
                item.snippet.thumbnails?.high?.url ||
                item.snippet.thumbnails?.medium?.url ||
                `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              channelTitle: item.snippet.channelTitle,
              publishedAt: item.snippet.publishedAt,
              duration: formatISO8601Duration(item.contentDetails?.duration),
              viewCount: formatViewCount(item.statistics?.viewCount),
            };
          }
        }
      } catch {}
    }

    // 2. Official YouTube oEmbed (Free, zero-auth, open CORS, 100% reliable for title & channel/artist)
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        if (data && data.title) {
          return {
            id: videoId,
            title: data.title,
            description: `Streamed in HD on SadduTube • Published by ${data.author_name || 'YouTube Creator'}`,
            thumbnailUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            channelTitle: data.author_name || 'YouTube Creator',
            publishedAt: new Date().toISOString(),
            duration: '3:45',
            viewCount: 'Popular',
          };
        }
      }
    } catch {}

    // 3. noembed.com fallback
    try {
      const noembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
      const res = await fetch(noembedUrl);
      if (res.ok) {
        const data = await res.json();
        if (data && data.title) {
          return {
            id: videoId,
            title: data.title,
            description: `Streamed in HD on SadduTube • Published by ${data.author_name || 'YouTube Creator'}`,
            thumbnailUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            channelTitle: data.author_name || 'YouTube Creator',
            publishedAt: new Date().toISOString(),
            duration: '3:45',
            viewCount: 'Popular',
          };
        }
      }
    } catch {}

    // 4. Live Public Instance details with parallel race
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
            thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            channelTitle: item.author || 'YouTube Creator',
            publishedAt:
              item.publishedText ||
              (item.published ? new Date(item.published * 1000).toISOString() : new Date().toISOString()),
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
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      channelTitle: 'YouTube Creator',
      publishedAt: new Date().toISOString(),
      duration: '10:00',
      viewCount: '100K views',
    };
  }

  private static async fetchFromInstances(urlPath: string, timeoutMs = 4500): Promise<any[]> {
    const promises = INVIDIOUS_INSTANCES.map(async (instance) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(`${instance}${urlPath}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
        throw new Error('No items in array');
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

  private static async searchFromLiveInstances(
    query: string,
    targetCount = 10,
    page = 1
  ): Promise<Video[]> {
    const mapItem = (item: any): Video | null => {
      const vId = item.videoId || item.id;
      if (!vId || !item.title) return null;
      return {
        id: vId,
        title: item.title,
        description: item.description || '',
        thumbnailUrl: `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
        channelTitle: item.author || 'YouTube Creator',
        publishedAt:
          item.publishedText ||
          (item.published ? new Date(item.published * 1000).toISOString() : new Date().toISOString()),
        duration: formatDurationSeconds(item.lengthSeconds),
        viewCount: item.viewCountText || formatViewCount(item.viewCount),
        category: 'Search Result',
      };
    };

    const singleData = await this.fetchFromInstances(
      `/api/v1/search?q=${encodeURIComponent(query)}&type=video&page=${page}`
    );

    const seen = new Set<string>();
    const videos: Video[] = [];
    for (const item of singleData) {
      const mapped = mapItem(item);
      if (mapped && !seen.has(mapped.id)) {
        seen.add(mapped.id);
        videos.push(mapped);
        if (videos.length >= targetCount) break;
      }
    }
    return videos;
  }

  private static async getPopularFromLiveInstances(
    targetCount = 10,
    page = 1
  ): Promise<Video[]> {
    const mapItem = (item: any): Video | null => {
      const vId = item.videoId || item.id;
      if (!vId || !item.title) return null;
      return {
        id: vId,
        title: item.title,
        description: item.description || '',
        thumbnailUrl: `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
        channelTitle: item.author || 'YouTube Creator',
        publishedAt:
          item.publishedText ||
          (item.published ? new Date(item.published * 1000).toISOString() : new Date().toISOString()),
        duration: formatDurationSeconds(item.lengthSeconds),
        viewCount: item.viewCountText || formatViewCount(item.viewCount),
        category: 'Trending',
      };
    };

    // Page 1 loads region IN trending; subsequent pages load general trending via search page
    const endpoint =
      page === 1
        ? '/api/v1/trending?region=IN'
        : `/api/v1/search?q=trending+videos+india&type=video&page=${page}`;

    const rawData = await this.fetchFromInstances(endpoint);
    const seen = new Set<string>();
    const videos: Video[] = [];

    for (const item of rawData) {
      const mapped = mapItem(item);
      if (mapped && !seen.has(mapped.id)) {
        seen.add(mapped.id);
        videos.push(mapped);
        if (videos.length >= targetCount) break;
      }
    }
    return videos;
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
