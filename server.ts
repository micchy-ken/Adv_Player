import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. API: Custom proxy to solve Android Chrome Ameblo desktop/mobile CORS issues once and for all!
  app.get("/api/proxy", async (req, res) => {
    let targetUrl = req.query.url as string;
    
    if (!targetUrl) {
      return res.status(400).json({ error: "URL query parameter is required." });
    }

    // Decoding and normalizing
    try {
      targetUrl = decodeURIComponent(targetUrl);
    } catch (e) {
      // Ignored if already decoded
    }

    if (targetUrl.includes("s.ameblo.jp")) {
      targetUrl = targetUrl.replace("s.ameblo.jp", "ameblo.jp");
    }

    // Clean typical Ameba affiliate, tracker, or layout override parameters
    try {
      const urlObj = new URL(targetUrl);
      const keysToRemove = ["frm_id", "device_id", "amba", "gamp", "amp", "page", "device"];
      keysToRemove.forEach(k => urlObj.searchParams.delete(k));
      targetUrl = urlObj.toString();
    } catch (e) {
      console.warn("Could not parse target URL object:", e);
    }

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
    try {
      console.log("[Proxy] Strategy 1: Direct Fetch");
      const response = await fetchWithTimeout(targetUrl, { headers, method: "GET" }, 4000);
      if (response.ok) {
        const html = await response.text();
        if (html && html.trim().length > 500) {
          console.log("[Proxy] Strategy 1 Succeeded!");
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          return res.send(html);
        }
      }
      console.warn(`[Proxy] Strategy 1 direct fetch returned status: ${response.status}`);
    } catch (e: any) {
      console.warn("[Proxy] Strategy 1 Failed or Timed out:", e.message || e);
    }

    // Strategy 2: Fetch via corsproxy.io on server-side (Bypasses Google Cloud block, enforces desktop agent)
    try {
      console.log("[Proxy] Strategy 2: corsproxy.io Fetch");
      const corsProxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
      const response = await fetchWithTimeout(corsProxyUrl, { headers, method: "GET" }, 4000);
      if (response.ok) {
        const html = await response.text();
        if (html && html.trim().length > 500) {
          console.log("[Proxy] Strategy 2 Succeeded!");
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          return res.send(html);
        }
      }
      console.warn(`[Proxy] Strategy 2 returned status: ${response.status}`);
    } catch (e: any) {
      console.warn("[Proxy] Strategy 2 Failed or Timed out:", e.message || e);
    }

    // Strategy 3: Fetch via api.allorigins.win on server-side
    try {
      console.log("[Proxy] Strategy 3: api.allorigins.win Fetch");
      const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&_=${Date.now()}`;
      const response = await fetchWithTimeout(allOriginsUrl, { method: "GET" }, 4500);
      if (response.ok) {
        const data = await response.json();
        const html = data?.contents;
        if (html && html.trim().length > 500) {
          console.log("[Proxy] Strategy 3 Succeeded!");
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          return res.send(html);
        }
      }
      console.warn(`[Proxy] Strategy 3 returned status: ${response.status}`);
    } catch (e: any) {
      console.warn("[Proxy] Strategy 3 Failed or Timed out:", e.message || e);
    }

    // Strategy 4: Fetch via codetabs.com on server-side
    try {
      console.log("[Proxy] Strategy 4: codetabs.com Fetch");
      const codetabsUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
      const response = await fetchWithTimeout(codetabsUrl, { headers, method: "GET" }, 4000);
      if (response.ok) {
        const html = await response.text();
        if (html && html.trim().length > 500) {
          console.log("[Proxy] Strategy 4 Succeeded!");
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          return res.send(html);
        }
      }
      console.warn(`[Proxy] Strategy 4 returned status: ${response.status}`);
    } catch (e: any) {
      console.warn("[Proxy] Strategy 4 Failed or Timed out:", e.message || e);
    }

    // If all strategies fail, return structured error
    console.error("[Proxy Error]: All 4 resilient strategies failed to retrieve blog content.");
    return res.status(502).json({ error: "全てのプロキシ試行に失敗しました。ブログサーバーにアクセスできないか、ブロックされています。" });
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
