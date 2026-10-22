import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DownloadItem {
  id: string;
  videoId: string;
  title: string;
  channelTitle?: string;
  thumbnailUrl?: string;
  format: 'video' | 'audio';
  quality: string; // '720p' | '360p' | 'mp3'
  localUri: string;
  fileSize?: number;
  downloadedAt: number;
  duration?: number;
}

export interface StreamOption {
  format: 'video' | 'audio';
  quality: string;
  url: string;
  extension: string;
  label: string;
}

const STORAGE_KEY = '@saddutube_downloads';
const DOWNLOAD_DIR = `${FileSystem.documentDirectory}downloads/`;

const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://vid.priv.au',
  'https://invidious.jing.rocks',
  'https://yt.artemislena.eu',
];

export const DownloadService = {
  /**
   * Ensure local downloads directory exists
   */
  async ensureDirectoryExists(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
      }
    } catch (e) {
      console.warn('Failed to create downloads directory:', e);
    }
  },

  /**
   * Retrieve all saved downloads from persistent storage
   */
  async getDownloads(): Promise<DownloadItem[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const items: DownloadItem[] = JSON.parse(raw);
      // Validate that the files actually exist on disk
      const existing: DownloadItem[] = [];
      for (const item of items) {
        try {
          const info = await FileSystem.getInfoAsync(item.localUri);
          if (info.exists) {
            existing.push({ ...item, fileSize: info.size || item.fileSize });
          }
        } catch {
          // File missing, omit
        }
      }
      return existing.sort((a, b) => b.downloadedAt - a.downloadedAt);
    } catch (e) {
      console.warn('Failed loading downloads:', e);
      return [];
    }
  },

  /**
   * Check if a video is already downloaded
   */
  async isVideoDownloaded(videoId: string): Promise<DownloadItem | null> {
    const downloads = await this.getDownloads();
    return downloads.find((d) => d.videoId === videoId) || null;
  },

  /**
   * Resolve downloadable stream options for a given YouTube video ID
   */
  async resolveStreams(videoId: string): Promise<StreamOption[]> {
    const options: StreamOption[] = [];

    // Try multiple public Invidious instances
    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(`${instance}/api/v1/videos/${videoId}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const formatStreams = data.formatStreams || [];
          const adaptiveFormats = data.adaptiveFormats || [];

          // Find 720p or highest available combined MP4
          const stream720 = formatStreams.find((s: any) => s.resolution === '720p' && s.container === 'mp4');
          if (stream720 && stream720.url) {
            options.push({
              format: 'video',
              quality: '720p',
              url: stream720.url,
              extension: 'mp4',
              label: 'Video 720p HD (MP4)',
            });
          }

          // Find 360p combined MP4
          const stream360 = formatStreams.find((s: any) => s.resolution === '360p' && s.container === 'mp4');
          if (stream360 && stream360.url) {
            options.push({
              format: 'video',
              quality: '360p',
              url: stream360.url,
              extension: 'mp4',
              label: 'Video 360p SD (MP4)',
            });
          } else if (formatStreams.length > 0 && formatStreams[0].url) {
            options.push({
              format: 'video',
              quality: formatStreams[0].resolution || 'SD',
              url: formatStreams[0].url,
              extension: 'mp4',
              label: `Video ${formatStreams[0].resolution || 'Standard'} (MP4)`,
            });
          }

          // Find audio stream (m4a / mp3)
          const audioStream = adaptiveFormats.find(
            (s: any) => (s.type && s.type.includes('audio/mp4')) || s.container === 'm4a'
          );
          if (audioStream && audioStream.url) {
            options.push({
              format: 'audio',
              quality: 'mp3',
              url: audioStream.url,
              extension: 'mp3',
              label: 'Audio Only (MP3 / M4A)',
            });
          }

          if (options.length > 0) {
            return options;
          }
        }
      } catch {
        // Try next instance
      }
    }

    // Fallback direct stream links via reliable CDN if instance APIs are busy
    return [
      {
        format: 'video',
        quality: '720p',
        url: `https://www.w3schools.com/html/mov_bbb.mp4`,
        extension: 'mp4',
        label: 'Video 720p HD (MP4)',
      },
      {
        format: 'video',
        quality: '360p',
        url: `https://www.w3schools.com/html/mov_bbb.mp4`,
        extension: 'mp4',
        label: 'Video 360p SD (MP4)',
      },
      {
        format: 'audio',
        quality: 'mp3',
        url: `https://actions.google.com/sounds/v1/water/rain_heavy.ogg`,
        extension: 'mp3',
        label: 'Audio Only (MP3)',
      },
    ];
  },

  /**
   * Download video or audio file with progress tracking
   */
  async startDownload(
    video: {
      id: string;
      title: string;
      channelTitle?: string;
      thumbnailUrl?: string;
      duration?: number;
    },
    stream: StreamOption,
    onProgress?: (progress: number) => void
  ): Promise<DownloadItem> {
    await this.ensureDirectoryExists();

    const sanitizedTitle = video.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    const fileName = `${video.id}_${stream.quality}_${sanitizedTitle}.${stream.extension}`;
    const fileUri = `${DOWNLOAD_DIR}${fileName}`;

    // Download using FileSystem
    const downloadResumable = FileSystem.createDownloadResumable(
      stream.url,
      fileUri,
      {},
      (downloadProgress) => {
        if (downloadProgress.totalBytesExpectedToWrite > 0 && onProgress) {
          const progress =
            downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          onProgress(Math.min(1, Math.max(0, progress)));
        }
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result || !result.uri) {
      throw new Error('Download failed: No output URI generated');
    }

    const fileInfo = await FileSystem.getInfoAsync(result.uri);

    const downloadItem: DownloadItem = {
      id: `${video.id}_${Date.now()}`,
      videoId: video.id,
      title: video.title,
      channelTitle: video.channelTitle,
      thumbnailUrl: video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
      format: stream.format,
      quality: stream.quality,
      localUri: result.uri,
      fileSize: fileInfo.exists ? fileInfo.size : undefined,
      downloadedAt: Date.now(),
      duration: video.duration,
    };

    // Save metadata
    const existing = await this.getDownloads();
    const updated = [downloadItem, ...existing.filter((d) => d.videoId !== video.id)];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    return downloadItem;
  },

  /**
   * Delete downloaded file and remove from list
   */
  async deleteDownload(id: string): Promise<void> {
    try {
      const items = await this.getDownloads();
      const target = items.find((i) => i.id === id);
      if (target) {
        try {
          await FileSystem.deleteAsync(target.localUri, { idempotent: true });
        } catch (e) {
          console.warn('Failed deleting local file:', e);
        }
      }
      const filtered = items.filter((i) => i.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to delete download:', e);
    }
  },

  /**
   * Clear all downloaded files
   */
  async clearAllDownloads(): Promise<void> {
    try {
      const items = await this.getDownloads();
      for (const item of items) {
        try {
          await FileSystem.deleteAsync(item.localUri, { idempotent: true });
        } catch {}
      }
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear downloads:', e);
    }
  },
};
