import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. API: Custom proxy to solve Android Chrome Ameblo desktop/mobile CORS issues once and for all!
  app.get("/api/proxy", async (req, res) => {
    let targetUrl = req.query.url as string;
    const logs: string[] = [];
    
    logs.push(`[Proxy] Received request for URL: ${targetUrl}`);

    if (!targetUrl) {
      logs.push("[Proxy] Error: URL parameter is missing.");
      return res.status(400).json({ success: false, error: "URL query parameter is required.", logs });
    }

    // Decoding and normalizing
    try {
      const decoded = decodeURIComponent(targetUrl);
      if (decoded !== targetUrl) {
        logs.push(`[Proxy] Normalized decoded URL: ${decoded}`);
        targetUrl = decoded;
      }
    } catch (e: any) {
      logs.push(`[Proxy] URL decode check: ${e.message || e}`);
    }

    if (targetUrl.includes("s.ameblo.jp")) {
      logs.push(`[Proxy] Mobile domain s.ameblo.jp detected. Rewriting to ameblo.jp for PC layout.`);
      targetUrl = targetUrl.replace("s.ameblo.jp", "ameblo.jp");
    }

    // Clean typical Ameba affiliate, tracker, or layout override parameters
    try {
      const urlObj = new URL(targetUrl);
      const keysToRemove = ["frm_id", "device_id", "amba", "gamp", "amp", "page", "device"];
      let removedCount = 0;
      keysToRemove.forEach(k => {
        if (urlObj.searchParams.has(k)) {
          urlObj.searchParams.delete(k);
          removedCount++;
        }
      });
      if (removedCount > 0) {
        logs.push(`[Proxy] Cleaned ${removedCount} tracking query parameter(s).`);
      }
      targetUrl = urlObj.toString();
    } catch (e: any) {
      logs.push(`[Proxy] URL parsing warning: ${e.message || e}`);
    }

    logs.push(`[Proxy] Finalized target URL: ${targetUrl}`);

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    };

    const fetchWithTimeout = async (url: string, options: any, timeoutMs = 4000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(id);
        return response;
      } catch (err) {
        clearTimeout(id);
        throw err;
      }
    };

    console.log(`[Proxy] Resilient fetch chain initiated for: ${targetUrl}`);

    // Strategy 1: Direct fetch with Desktop User-Agent
    const t0 = Date.now();
    try {
      logs.push(`[Proxy] Strategy 1: Direct Fetch beginning...`);
      const response = await fetchWithTimeout(targetUrl, { headers, method: "GET" }, 4000);
      logs.push(`[Proxy] Strategy 1 responded with HTTP ${response.status}`);
      if (response.ok) {
        const html = await response.text();
        if (html && html.trim().length > 500) {
          logs.push(`[Proxy] Strategy 1 succeeded! Loaded ${html.length} chars in ${Date.now() - t0}ms`);
          return res.json({ success: true, html, logs });
        } else {
          logs.push(`[Proxy] Strategy 1 returned empty or extremely short content (${html?.length || 0} chars).`);
        }
      }
    } catch (e: any) {
      logs.push(`[Proxy] Strategy 1 failed/timed out in ${Date.now() - t0}ms. Error: ${e.message || e}`);
    }

    // Strategy 2: Fetch via corsproxy.io on server-side
    const t1 = Date.now();
    try {
      logs.push(`[Proxy] Strategy 2: corsproxy.io Fetch beginning...`);
      const corsProxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
      const response = await fetchWithTimeout(corsProxyUrl, { headers, method: "GET" }, 4000);
      logs.push(`[Proxy] Strategy 2 responded with HTTP ${response.status}`);
      if (response.ok) {
        const html = await response.text();
        if (html && html.trim().length > 500) {
          logs.push(`[Proxy] Strategy 2 succeeded! Loaded ${html.length} chars in ${Date.now() - t1}ms`);
          return res.json({ success: true, html, logs });
        } else {
          logs.push(`[Proxy] Strategy 2 returned short content (${html?.length || 0} chars).`);
        }
      }
    } catch (e: any) {
      logs.push(`[Proxy] Strategy 2 failed/timed out in ${Date.now() - t1}ms. Error: ${e.message || e}`);
    }

    // Strategy 3: Fetch via api.allorigins.win on server-side
    const t2 = Date.now();
    try {
      logs.push(`[Proxy] Strategy 3: api.allorigins.win Fetch beginning...`);
      const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&_=${Date.now()}`;
      const response = await fetchWithTimeout(allOriginsUrl, { method: "GET" }, 4500);
      logs.push(`[Proxy] Strategy 3 responded with HTTP ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        const html = data?.contents;
        if (html && html.trim().length > 500) {
          logs.push(`[Proxy] Strategy 3 succeeded! Loaded ${html.length} chars in ${Date.now() - t2}ms`);
          return res.json({ success: true, html, logs });
        } else {
          logs.push(`[Proxy] Strategy 3 returned null/short contents.`);
        }
      }
    } catch (e: any) {
      logs.push(`[Proxy] Strategy 3 failed/timed out in ${Date.now() - t2}ms. Error: ${e.message || e}`);
    }

    // Strategy 4: Fetch via codetabs.com on server-side
    const t3 = Date.now();
    try {
      logs.push(`[Proxy] Strategy 4: codetabs.com Fetch beginning...`);
      const codetabsUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
      const response = await fetchWithTimeout(codetabsUrl, { headers, method: "GET" }, 4000);
      logs.push(`[Proxy] Strategy 4 responded with HTTP ${response.status}`);
      if (response.ok) {
        const html = await response.text();
        if (html && html.trim().length > 500) {
          logs.push(`[Proxy] Strategy 4 succeeded! Loaded ${html.length} chars in ${Date.now() - t3}ms`);
          return res.json({ success: true, html, logs });
        } else {
          logs.push(`[Proxy] Strategy 4 returned short content.`);
        }
      }
    } catch (e: any) {
      logs.push(`[Proxy] Strategy 4 failed/timed out in ${Date.now() - t3}ms. Error: ${e.message || e}`);
    }

    // If all failed
    logs.push(`[Proxy] All 4 strategies failed.`);
    return res.status(502).json({
      success: false,
      error: "プロキシサーバー経由のすべてのフェッチ試行が失敗、またはタイムアウトしました。",
      logs
    });
  });

  // 2. Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
