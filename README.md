# SaaS Google Reviews Widget AI

This workspace contains a full-stack implementation plan for a Google Reviews widget powered by AI:

- `backend/` – Express + TypeScript services for syncing Google Reviews, summarizing with AI, and exposing REST endpoints.
- `frontend/dashboard/` – Next.js dashboard for managing Google credentials, sync cadence, and viewing AI insights.
- `frontend/embed/` – Widget bundle that sites can embed to show reviews/highlights with theming options.
- `shared/` – Centralized TypeScript types and helpers so backend and frontend stay aligned.

Use `npm install` followed by workspace scripts (`npm run dev:backend`, `dev:dashboard`, `dev:embed`) to start each area. Read the individual README files in each workspace for more details.

