import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function scrapePlugin(): Plugin {
  return {
    name: 'scrape-proxy-middleware',
    configureServer(server) {
      server.middlewares.use('/api/scrape', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', 'http://localhost');
          const targetUrl = urlObj.searchParams.get('url');

          if (!targetUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing url query parameter' }));
            return;
          }

          const fetchRes = await fetch(targetUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept':
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            },
          });

          if (!fetchRes.ok) {
            res.statusCode = fetchRes.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: `Failed to fetch target URL (HTTP ${fetchRes.status}: ${fetchRes.statusText})`,
              })
            );
            return;
          }

          const html = await fetchRes.text();
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: err.message || 'Server scraping error',
            })
          );
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), scrapePlugin()],
});
