# Backend

Express + TypeScript service that:

- syncs Google Reviews via `fetchReviewsFromGoogle`.
- summarizes them with OpenAI through `reviewSummarizer`.
- persists a lightweight state file in `data/review-store.json`.

### Setup

1. Copy `../.env.example` to `.env` and fill in the keys.
2. Run `npm install` at the repo root to install backend dependencies via workspaces.
3. Use `npm run dev:backend` from the repo root to start the server with live reload.

### Endpoints

- `POST /api/reviews/sync` — manually triggers Google sync and AI summarization.
- `GET /api/reviews/summary` — returns cached summary (needs at least one sync).
- `GET /api/health` — simple health check for uptime.

### Scheduling

`OVERRIDE_SYNC_CRON` controls the cron expression; the default sync runs hourly.

