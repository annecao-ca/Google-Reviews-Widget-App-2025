# Deployment & Ops Notes

## Environment & Secrets

- `GOOGLE_API_KEY`, `GOOGLE_PLACE_ID`, `OPENAI_API_KEY`, `DATABASE_URL` (if swapping review store with a persistent DB), `OVERRIDE_SYNC_CRON`.
- Shared frontends read `NEXT_PUBLIC_WIDGET_BASE_URL` so the widget/dashboard can reach the backend domain.
- Copy `.env.example` at the root into each environment before running services.

## Backend Deployment

1. Install dependencies via workspaces (`npm install`).
2. Build TypeScript: `cd backend && npm run build`.
3. Run `node dist/index.js` or wrap with a process manager (PM2, systemd) pointing to the `.env`.
4. Ensure the cron expression from `OVERRIDE_SYNC_CRON` is valid before bootstrapping — `node-cron` validates on startup and logs a warning if it fails.
5. Expose `/api/reviews/sync` and `/api/reviews/summary`; allow your dashboard/embed to call them (remember to handle CORS if you add a CDN).

## Frontend Deployment

- **Dashboard**: Deploy the Next.js app to Vercel/Netlify. Set `NEXT_PUBLIC_WIDGET_BASE_URL` to the backend API host.
- **Embed Widget**: Build `frontend/embed` (run `npm run build` inside the workspace) and serve the compiled bundle + `embed.js` from a CDN or static bucket. Update `embed.js` data attributes accordingly.

## Monitoring & Ops

- Watch the `backend/data/review-store.json` file to confirm syncs landed; logs contain timestamps.
- Schedule a heartbeat check hitting `/api/health`.
- In production, swap the file-backed `ReviewStore` with a Postgres/Supabase-backed implementation and point `DATABASE_URL` to that database. The existing exports make it easy to plug in a different repository.

