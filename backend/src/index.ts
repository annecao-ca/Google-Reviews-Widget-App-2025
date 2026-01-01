import path from "path";
import { ReviewSyncService } from "./services/reviewSyncService";
import { scheduleGoogleReviewSync } from "./jobs/syncGoogleReviews";
import { resolvePlaceIdFromText } from "./services/placeResolver";
import { WidgetStore } from "./services/widgetStore";
import { prisma } from "./lib/prisma";

// Railway/Vercel: process.env.XYZ tự có, không cần dotenv
const express = require("express");
const cors = require("cors");
const projectRoot = process.cwd().endsWith("backend")
  ? path.resolve(process.cwd(), "..")
  : process.cwd();

const app = express();
app.use(cors());
app.use(express.json());

// Serve widget static files
const embedDistPath = path.join(projectRoot, "frontend", "embed", "dist");
const embedSrcPath = path.join(projectRoot, "frontend", "embed");

// Serve widget.js (compiled from TypeScript)
app.get("/widget.js", (_req, res) => {
  res.sendFile(path.join(embedDistPath, "widget.js"), (err) => {
    if (err) {
      console.error("Failed to serve widget.js:", err);
      res.status(404).send("Widget file not found. Please build the widget first: cd frontend/embed && npm run build");
    }
  });
});

// Serve embed.js (loader script)
app.get("/embed.js", (_req, res) => {
  res.sendFile(path.join(embedSrcPath, "embed.js"), (err) => {
    if (err) {
      console.error("Failed to serve embed.js:", err);
      res.status(404).send("Embed file not found");
    }
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5001;
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn("Warning: GOOGLE_API_KEY is missing. API calls will fail.");
}

const widgetStore = new WidgetStore();

// Optional: default place sync if env is provided (for your own site)
// This is now discouraged in SaaS mode but kept for backward compatibility if specifically configured
const defaultPlaceId = process.env.GOOGLE_PLACE_ID;
// Note: Manual background sync for "default" place is complicated with widgetId. 
// We should probably rely on widget-specific syncs.


// Legacy single-place endpoints (optional)
app.post("/api/reviews/sync", async (_req, res) => {
  if (!defaultPlaceId) {
    return res.status(400).json({ error: "GOOGLE_PLACE_ID not configured" });
  }
  if (!apiKey) {
    return res.status(400).json({ error: "GOOGLE_API_KEY not configured" });
  }
  try {
    const service = new ReviewSyncService(defaultPlaceId, apiKey, "default");
    const result = await service.sync();

    res.json({ message: "sync completed", ...result });
  } catch (error) {
    console.error("Manual sync failed:", error);
    res.status(500).json({ error: "sync failed" });
  }
});

app.get("/api/reviews/summary", async (_req, res) => {
  if (!defaultPlaceId) {
    return res.status(400).json({ error: "GOOGLE_PLACE_ID not configured" });
  }
  if (!apiKey) {
    return res.status(400).json({ error: "GOOGLE_API_KEY not configured" });
  }
  try {
    const service = new ReviewSyncService(defaultPlaceId, apiKey, "default");
    const summary = await service.getSummary();

    if (!summary) {
      return res.status(404).json({ error: "no summary yet. trigger sync first" });
    }
    return res.json(summary);
  } catch (error) {
    console.error("Failed to load summary:", error);
    return res.status(500).json({ error: "could not load summary" });
  }
});

// --- Multi-widget endpoints ---

app.get("/api/widgets", async (_req, res) => {
  try {
    const widgets = await prisma.widget.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ widgets });
  } catch (error) {
    console.error("List widgets failed:", error);
    return res.status(500).json({ error: "failed to list widgets" });
  }
});
app.get("/api/widgets/:id", async (req, res) => {
  try {
    const widget = await widgetStore.get(req.params.id);
    if (!widget) return res.status(404).json({ error: "widget not found" });
    return res.json({ widget });
  } catch (error) {
    console.error("Get widget failed:", error);
    return res.status(500).json({ error: "failed to get widget" });
  }
});

app.get("/api/places/search", async (req, res) => {

  const q = String(req.query.q ?? "").trim();
  if (!q) {
    return res.status(400).json({ error: "missing q" });
  }
  if (!apiKey) {
    return res.status(400).json({ error: "GOOGLE_API_KEY not configured" });
  }

  try {
    const results = await resolvePlaceIdFromText(q, apiKey);
    return res.json({ results: results ?? [] });
  } catch (error) {
    console.error("Place search failed:", error);
    return res.status(500).json({ error: "failed to search places" });
  }
});

app.post("/api/widgets", async (req, res) => {
  const { query, title, theme } = req.body ?? {};
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "missing query" });
  }
  if (!apiKey) {
    return res.status(400).json({ error: "GOOGLE_API_KEY not configured" });
  }

  try {
    console.log(`[POST /api/widgets] Searching for: "${query}"`);
    const candidates = await resolvePlaceIdFromText(query, apiKey);
    if (!candidates || !candidates.length) {
      console.log(`[POST /api/widgets] No places found for: "${query}"`);
      return res.status(404).json({
        error: "no place found",
        query,
        hint: "Thử nhập địa chỉ đầy đủ hơn hoặc kiểm tra Google API key có bật Places API chưa"
      });
    }

    console.log(`[POST /api/widgets] Found ${candidates.length} candidate(s)`);
    const primary = candidates[0];
    const widget = await widgetStore.create({
      placeId: primary.placeId,
      businessName: primary.name,
      title: title || primary.name,
      settings: req.body.settings
    });

    // --- Auto-sync initial reviews on creation ---
    try {
      console.log(`[POST /api/widgets] Initializing auto-sync for widget: ${widget.id}`);
      const syncService = new ReviewSyncService(widget.placeId, apiKey, widget.id);
      await syncService.sync();
      console.log(`[POST /api/widgets] Auto-sync completed for: ${widget.id}`);
    } catch (syncError) {
      console.error("[POST /api/widgets] Initial sync failed (will retry in background):", syncError);
    }

    const backendBase = process.env.NEXT_PUBLIC_WIDGET_BASE_URL ?? `http://localhost:${PORT}`;
    const embedCode = `
<div id="google-reviews-widget"></div>
<script src="${backendBase}/widget.js" async></script>
<script
  defer
  src="${backendBase}/embed.js"
  data-container-id="google-reviews-widget"
  data-backend="${backendBase}"
  data-widget-id="${widget.id}">
</script>`.trim();

    return res.json({ widget, embedCode, candidates });
  } catch (error: any) {
    console.error("Create widget failed:", error);
    const message = error?.message || "failed to create widget";
    return res.status(500).json({ error: message, details: String(error) });
  }
});

app.patch("/api/widgets/:id", async (req, res) => {
  const widgetId = req.params.id;
  const { title, settings } = req.body;
  try {
    const widget = await widgetStore.update(widgetId, { title, settings });
    return res.json({ widget });
  } catch (error) {
    console.error("Update widget failed:", error);
    return res.status(500).json({ error: "failed to update widget" });
  }
});


app.post("/api/widgets/:id/sync", async (req, res) => {
  const widgetId = req.params.id;
  if (!apiKey) {
    return res.status(400).json({ error: "GOOGLE_API_KEY not configured" });
  }
  try {
    const widget = await widgetStore.get(widgetId);
    if (!widget) {
      return res.status(404).json({ error: "widget not found" });
    }
    const service = new ReviewSyncService(widget.placeId, apiKey, widgetId);
    const result = await service.sync();

    return res.json({ message: "sync completed", ...result });
  } catch (error) {
    console.error("Widget sync failed:", error);
    return res.status(500).json({ error: "sync failed" });
  }
});

app.get("/api/widgets/:id/summary", async (req, res) => {
  const widgetId = req.params.id;
  if (!apiKey) {
    return res.status(400).json({ error: "GOOGLE_API_KEY not configured" });
  }
  try {
    const widget = await widgetStore.get(widgetId);
    if (!widget) {
      return res.status(404).json({ error: "widget not found" });
    }
    const service = new ReviewSyncService(widget.placeId, apiKey, widgetId);
    const summary = await service.getSummary(widget.settings);

    if (!summary) {
      return res.status(404).json({ error: "no summary yet. trigger sync first" });
    }
    return res.json(summary);
  } catch (error) {
    console.error("Widget summary failed:", error);
    return res.status(500).json({ error: "could not load summary" });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "google-reviews-widget" });
});

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend listening at http://localhost:${PORT}`);
  });
}

export default app;

