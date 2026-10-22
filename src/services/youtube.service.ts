import { Video } from '../types';
import { formatISO8601Duration, formatViewCount } from '../utils/formatters';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Fallback dataset representing a genuinely diverse mix of general YouTube content:
 * Entertainment, Music, Gaming, Travel, Cooking, Sports, News, Science, Vlogs, Comedy, Education, Tech.
 */
const GENERAL_DEMO_YOUTUBE_VIDEOS: Video[] = [
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
    id: 'dF0nL709jW8',
    title: 'What Happens inside a Black Hole? | Cosmos Explained',
    description: 'Journey into event horizons and singularity to discover the physics of black holes in deep space.',
    thumbnailUrl: 'https://img.youtube.com/vi/dF0nL709jW8/hqdefault.jpg',
    channelTitle: 'Cosmos & Science',
    publishedAt: '2023-12-01T18:00:00Z',
    duration: '16:08',
    viewCount: '4.7M views',
    category: 'Science & Education',
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
  {
    id: 'g6BtbIiJ_EI',
    title: 'Full Body 20 Minute Daily Fitness & Mobility Workout',
    description: 'No equipment needed! Follow along with this daily morning workout routine to boost energy and flexibility.',
    thumbnailUrl: 'https://img.youtube.com/vi/g6BtbIiJ_EI/hqdefault.jpg',
    channelTitle: 'FitLife Daily',
    publishedAt: '2024-02-28T07:00:00Z',
    duration: '21:05',
    viewCount: '1.4M views',
    category: 'Fitness & Health',
  },
];

export class YouTubeService {
  private static getApiKey(): string | undefined {
    return process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
  }

  /**
   * Returns whether a valid API key is configured
   */
  static isApiKeyConfigured(): boolean {
    const key = this.getApiKey();
    return !!key && key.trim().length > 0 && key !== 'YOUR_YOUTUBE_API_KEY_HERE';
  }

  /**
   * Fetch general popular / trending YouTube videos across ALL categories (no category restrictions).
   */
  static async getPopularVideos(maxResults = 15): Promise<Video[]> {
    const apiKey = this.getApiKey();

    if (!this.isApiKeyConfigured() || !apiKey) {
      return GENERAL_DEMO_YOUTUBE_VIDEOS;
    }

    try {
      const url = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=${maxResults}&regionCode=US&key=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        return data.items.map((item: any) => ({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          duration: formatISO8601Duration(item.contentDetails?.duration),
          viewCount: formatViewCount(item.statistics?.viewCount),
          category: item.snippet.categoryTitle || 'General',
        }));
      }
    } catch (error) {
      console.warn('Failed fetching popular YouTube videos, using demo dataset:', error);
    }

    return GENERAL_DEMO_YOUTUBE_VIDEOS;
  }

  /**
   * Search YouTube for ANY user query across all categories without restrictions.
   */
  static async searchVideos(query: string, maxResults = 15): Promise<Video[]> {
    const apiKey = this.getApiKey();

    if (!this.isApiKeyConfigured() || !apiKey) {
      return this.getFallbackSearchResults(query);
    }

    try {
      const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(
        query
      )}&key=${apiKey}`;

      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`YouTube API HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        return [];
      }

      const videoIds = data.items.map((item: any) => item.id.videoId).filter(Boolean).join(',');
      const detailsMap = await this.getVideoDetailsMap(videoIds, apiKey);

      return data.items.map((item: any) => {
        const vId = item.id.videoId;
        const details = detailsMap[vId] || {};
        return {
          id: vId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          duration: details.duration ? formatISO8601Duration(details.duration) : '10:00',
          viewCount: details.viewCount ? formatViewCount(details.viewCount) : 'Views unavailable',
        };
      });
    } catch (error) {
      console.warn('YouTube API Search failed, using demo search dataset:', error);
      return this.getFallbackSearchResults(query);
    }
  }

  /**
   * Fetch details for a single video ID
   */
  static async getVideoById(videoId: string): Promise<Video> {
    const apiKey = this.getApiKey();

    const localMatch = GENERAL_DEMO_YOUTUBE_VIDEOS.find((v) => v.id === videoId);

    if (!this.isApiKeyConfigured() || !apiKey) {
      if (localMatch) return localMatch;
      return {
        id: videoId,
        title: `YouTube Video (${videoId})`,
        description: 'Watch general YouTube content in Vidyo Pro.',
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        channelTitle: 'YouTube Creator',
        publishedAt: new Date().toISOString(),
        duration: '12:30',
        viewCount: '250K views',
      };
    }

    try {
      const url = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        return {
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          duration: formatISO8601Duration(item.contentDetails?.duration),
          viewCount: formatViewCount(item.statistics?.viewCount),
        };
      }
    } catch (error) {
      console.warn(`Failed fetching YouTube video ${videoId}:`, error);
    }

    if (localMatch) return localMatch;

    return {
      id: videoId,
      title: `YouTube Video (${videoId})`,
      description: 'Streamed via supported YouTube embed.',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      channelTitle: 'YouTube Creator',
      publishedAt: new Date().toISOString(),
      duration: '10:00',
      viewCount: '100K views',
    };
  }

  /**
   * Helper to fetch video statistics details map
   */
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
    } catch (e) {
      // ignore
    }
    return map;
  }

  /**
   * Fallback search algorithm searching across general multi-category dataset
   */
  private static getFallbackSearchResults(query: string): Video[] {
    const q = query.toLowerCase().trim();
    if (!q) return GENERAL_DEMO_YOUTUBE_VIDEOS;

    const filtered = GENERAL_DEMO_YOUTUBE_VIDEOS.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.channelTitle.toLowerCase().includes(q) ||
        (v.category && v.category.toLowerCase().includes(q))
    );

    if (filtered.length > 0) return filtered;

    // Dynamic result matching query
    return [
      {
        id: 'dQw4w9WgXcQ',
        title: `YouTube Video result for "${query}"`,
        description: `YouTube video matching your search "${query}". Tap to watch via YouTube embed.`,
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        channelTitle: 'YouTube Content Creator',
        publishedAt: new Date().toISOString(),
        duration: '14:20',
        viewCount: '500K views',
      },
      ...GENERAL_DEMO_YOUTUBE_VIDEOS.slice(0, 3),
    ];
  }
}
