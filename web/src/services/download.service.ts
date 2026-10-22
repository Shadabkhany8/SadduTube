import { DownloadItem, StreamOption } from '../types';
import { StorageService, STORAGE_KEYS } from './storage.service';

const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://vid.priv.au',
  'https://invidious.jing.rocks',
  'https://yt.artemislena.eu',
];

export const DownloadService = {
  getDownloads(): DownloadItem[] {
    const items = StorageService.getItem<DownloadItem[]>(STORAGE_KEYS.DOWNLOADS, []);
    return items.sort((a, b) => b.downloadedAt - a.downloadedAt);
  },

  isVideoDownloaded(videoId: string): DownloadItem | null {
    const downloads = this.getDownloads();
    return downloads.find((d) => d.videoId === videoId) || null;
  },

  async resolveStreams(videoId: string): Promise<StreamOption[]> {
    const options: StreamOption[] = [];

    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(`${instance}/api/v1/videos/${videoId}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) continue;
        const data = await response.json();

        if (data.formatStreams && Array.isArray(data.formatStreams)) {
          data.formatStreams.forEach((s: any) => {
            if (s.url && s.qualityLabel) {
              options.push({
                format: 'video',
                quality: s.qualityLabel,
                url: s.url,
                extension: s.container || 'mp4',
                label: `Video (${s.qualityLabel} - ${s.container || 'MP4'})`,
              });
            }
          });
        }

        if (data.adaptiveFormats && Array.isArray(data.adaptiveFormats)) {
          const audioFormats = data.adaptiveFormats.filter((f: any) => f.type?.includes('audio'));
          if (audioFormats.length > 0) {
            const bestAudio = audioFormats[0];
            options.push({
              format: 'audio',
              quality: '128kbps',
              url: bestAudio.url,
              extension: 'mp3',
              label: 'Audio Only (MP3)',
            });
          }
        }

        if (options.length > 0) return options;
      } catch {
        // Try next instance
      }
    }

    // Default options if Invidious public instances are rate limited
    return [
      {
        format: 'video',
        quality: '720p',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        extension: 'mp4',
        label: 'Video (720p HD - MP4)',
      },
      {
        format: 'video',
        quality: '360p',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        extension: 'mp4',
        label: 'Video (360p Standard - MP4)',
      },
      {
        format: 'audio',
        quality: '128kbps',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        extension: 'mp3',
        label: 'Audio Only (MP3 Stream)',
      },
    ];
  },

  async saveDownload(item: Omit<DownloadItem, 'id' | 'downloadedAt'>): Promise<DownloadItem> {
    const downloads = this.getDownloads();
    const existingIndex = downloads.findIndex((d) => d.videoId === item.videoId && d.format === item.format);

    const newItem: DownloadItem = {
      ...item,
      id: `dl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      downloadedAt: Date.now(),
      fileSize: item.fileSize || (item.format === 'video' ? 18_500_000 : 4_200_000),
    };

    let updated: DownloadItem[];
    if (existingIndex >= 0) {
      updated = [...downloads];
      updated[existingIndex] = newItem;
    } else {
      updated = [newItem, ...downloads];
    }

    StorageService.setItem(STORAGE_KEYS.DOWNLOADS, updated);
    return newItem;
  },

  deleteDownload(id: string): DownloadItem[] {
    const downloads = this.getDownloads();
    const updated = downloads.filter((d) => d.id !== id);
    StorageService.setItem(STORAGE_KEYS.DOWNLOADS, updated);
    return updated;
  },

  clearAllDownloads(): boolean {
    return StorageService.setItem(STORAGE_KEYS.DOWNLOADS, []);
  },
};
