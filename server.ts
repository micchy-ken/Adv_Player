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

    try {
      // Decode and normalize URL
      targetUrl = decodeURIComponent(targetUrl);
      
      // Prevent s.ameblo.jp (mobile layout with limited text) issues
      if (targetUrl.includes("s.ameblo.jp")) {
        targetUrl = targetUrl.replace("s.ameblo.jp", "ameblo.jp");
      }

      // Clean typical Ameba affiliate, tracker, or layout override parameters
      const urlObj = new URL(targetUrl);
      const keysToRemove = ["frm_id", "device_id", "amba", "gamp", "amp", "page", "device"];
      keysToRemove.forEach(k => urlObj.searchParams.delete(k));
      const cleanUrl = urlObj.toString();

      console.log(`[Proxy] Fetching target: ${cleanUrl}`);

      // We explicitly fetch with a desktop user-agent.
      // This forces Ameba Blog to serve the complete static PC markup rather than mobile SPA fallbacks
      const response = await fetch(cleanUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
        method: "GET"
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Target server responded with status: ${response.status}` });
      }

      const htmlContent = await response.text();
      
      // Set appropriate response headers and return html
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.send(htmlContent);
      
    } catch (e: any) {
      console.error("[Proxy Error]:", e);
      return res.status(500).json({ error: `Proxy failed to fetch target: ${e.message || e}` });
    }
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
