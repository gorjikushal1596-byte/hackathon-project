/**
 * Service to fetch and extract raw HTML from live URLs
 * Uses CORS-resilient proxies for browser compatibility.
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
    name: 'Example Domain (Simple HTML)',
    url: 'https://example.com',
  },
  {
    name: 'W3C Accessibility Overview',
    url: 'https://www.w3.org/WAI/fundamentals/accessibility-intro/',
  },
  {
    name: 'Wikipedia Main Portal',
    url: 'https://en.wikipedia.org/wiki/Main_Page',
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
      error: 'Please enter a valid website URL (e.g. https://example.com).',
    };
  }

  // Proxies to try in sequence for CORS compatibility in browser environments
  const proxyEndpoints = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanedUrl)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(cleanedUrl)}`,
    cleanedUrl, // direct attempt
  ];

  let lastError = 'Failed to retrieve website HTML.';

  for (const endpoint of proxyEndpoints) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        lastError = `HTTP error ${response.status}: ${response.statusText}`;
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
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Network request failed';
    }
  }

  return {
    url: cleanedUrl,
    html: '',
    status: 'error',
    error: `Unable to fetch ${cleanedUrl} directly due to CORS restrictions or server timeout (${lastError}). Try uploading an exported .html file or pasting the page source directly.`,
  };
}
