/**
 * Real-Time YouTube Search Suggestions Service
 * Uses Google Suggest JSONP endpoint for instant, CORS-free suggestions in any web browser.
 */
export class SuggestionService {
  private static cache = new Map<string, string[]>();

  static async getLiveSuggestions(query: string): Promise<string[]> {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    if (this.cache.has(trimmed)) {
      return this.cache.get(trimmed)!;
    }

    if (typeof window === 'undefined') return [];

    return new Promise((resolve) => {
      const callbackName = `__yt_suggest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      let resolved = false;

      const cleanup = () => {
        try {
          delete (window as any)[callbackName];
          const script = document.getElementById(callbackName);
          if (script && script.parentNode) {
            script.parentNode.removeChild(script);
          }
        } catch {}
      };

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve([]);
        }
      }, 2500);

      (window as any)[callbackName] = (data: any) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        cleanup();

        try {
          const suggestions: string[] = [];
          if (Array.isArray(data) && Array.isArray(data[1])) {
            for (const item of data[1]) {
              if (typeof item === 'string') {
                suggestions.push(item);
              } else if (Array.isArray(item) && typeof item[0] === 'string') {
                suggestions.push(item[0]);
              }
            }
          }
          const results = suggestions.slice(0, 10);
          SuggestionService.cache.set(trimmed, results);
          resolve(results);
        } catch {
          resolve([]);
        }
      };

      try {
        const script = document.createElement('script');
        script.id = callbackName;
        script.src = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(
          trimmed
        )}&jsonp=${callbackName}`;
        script.onerror = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            cleanup();
            resolve([]);
          }
        };
        document.body.appendChild(script);
      } catch {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          cleanup();
          resolve([]);
        }
      }
    });
  }
}
