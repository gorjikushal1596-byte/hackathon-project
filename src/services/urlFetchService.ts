/**
 * Service to fetch and extract raw HTML from ANY live URL
 * Uses local Node.js server scraping middleware as primary, with resilient fallback proxies.
 */

export interface UrlFetchResult {
  url: string;
  html: string;
  status: 'success' | 'error';
  error?: string;
  byteSize?: number;
}

export const PRESET_LIVE_URLS = [
  {
    name: 'Google (google.com)',
    url: 'https://www.google.com',
  },
  {
    name: 'Wikipedia (Web Accessibility)',
    url: 'https://en.wikipedia.org/wiki/Web_accessibility',
  },
  {
    name: 'Hacker News (ycombinator.com)',
    url: 'https://news.ycombinator.com',
  },
  {
    name: 'W3C Accessibility Portal',
    url: 'https://www.w3.org/WAI/fundamentals/accessibility-intro/',
  },
  {
    name: 'Example Domain (Minimal HTML)',
    url: 'https://example.com',
  },
];

export async function fetchHtmlFromUrl(targetUrl: string): Promise<UrlFetchResult> {
  let cleanedUrl = targetUrl.trim();
  if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
    cleanedUrl = `https://${cleanedUrl}`;
  }

  try {
    new URL(cleanedUrl);
  } catch {
    return {
      url: targetUrl,
      html: '',
      status: 'error',
      error: 'Please enter a valid website URL (e.g. https://www.google.com or wikipedia.org).',
    };
  }

  // Endpoints to try in order of speed and reliability:
  // 1. Local Vite dev server backend scraper (/api/scrape) - 0 CORS restrictions, fast, reliable
  // 2. AllOrigins raw proxy
  // 3. CodeTabs proxy
  // 4. CorsProxy.io
  const endpoints = [
    `/api/scrape?url=${encodeURIComponent(cleanedUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanedUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(cleanedUrl)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(cleanedUrl)}`,
  ];

  let lastError = 'Failed to retrieve website HTML.';

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errJson: any = null;
        try {
          errJson = await response.json();
        } catch {
          // ignore
        }
        lastError = errJson?.error || `HTTP error ${response.status}: ${response.statusText}`;
        continue;
      }

      const html = await response.text();
      if (html && html.length > 20) {
        return {
          url: cleanedUrl,
          html,
          status: 'success',
          byteSize: new Blob([html]).size,
        };
      }
    } catch (err: any) {
      lastError = err.name === 'AbortError' ? 'Request timed out' : err instanceof Error ? err.message : 'Network request failed';
    }
  }

  return {
    url: cleanedUrl,
    html: '',
    status: 'error',
    error: `Unable to fetch ${cleanedUrl} (${lastError}). You can also save the page via Ctrl+S and upload the .html file!`,
  };
}
