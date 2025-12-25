# Dashboard

Next.js app that visualizes the current Google Reviews sync and exposes controls for manual sync + configuration hints.

### Key features

- Calls `NEXT_PUBLIC_WIDGET_BASE_URL/api/reviews/summary` to surface cached AI insights.
- Allows triggering `POST /api/reviews/sync` from the UI.
- Provides guidance for the embed widget, including snippet copy instructions.

### Local development

1. Set `NEXT_PUBLIC_WIDGET_BASE_URL` in `.env` or `.env.local` (e.g. `http://localhost:4000`).
2. Run `npm run dev:dashboard` from the repository root to start the dashboard.

