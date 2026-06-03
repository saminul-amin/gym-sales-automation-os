# Next.js Frontend and Express Backend Guide

This project now includes a professional web app built with:

| Layer | Technology | Location |
| --- | --- | --- |
| Frontend | Next.js 16 App Router, React 19, lucide-react | `apps/frontend` |
| Backend | Express.js 5 API | `src/backend` |
| Automation edge | Cloudflare Worker | `src/cloudflare-worker` |

## App Architecture

```text
Browser
  -> Next.js 16 frontend on localhost:3000
  -> Express API on localhost:4000
  -> Cloudflare Worker /lead
  -> n8n webhook
```

The browser never receives the Worker shared secret. Lead submissions go through the Express backend, and the backend forwards to the Worker only when Worker proxy mode is configured.

## Run Both Frontend and Backend

From the project root:

```powershell
npm.cmd run app:dev
```

Open:

```text
http://localhost:3000
```

This starts:

| Service | URL |
| --- | --- |
| Next.js frontend | `http://localhost:3000` |
| Express backend | `http://localhost:4000` |

## Run Separately

Backend only:

```powershell
npm.cmd run backend:dev
```

Frontend only:

```powershell
npm.cmd run frontend:dev
```

## Environment Variables

Create `.env.local` in the project root:

```text
BACKEND_PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
WORKER_BASE_URL=https://your-worker-subdomain.workers.dev
WORKER_SHARED_SECRET=your-worker-secret
```

If `WORKER_BASE_URL` and `WORKER_SHARED_SECRET` are missing, the Express backend runs in local demo mode and stores submitted leads in:

```text
data/app-state.json
```

That file is ignored by git.

## Frontend Views

The Next.js app includes:

1. `Overview` - KPIs, sales pipeline chart, retention risk chart, priority tasks, recent automation
2. `Lead Intake` - polished public-facing trial request form
3. `Pipeline` - searchable and filterable lead table
4. `Members` - retention risk and upsell view
5. `Tasks` - owner work queue
6. `Campaigns` - campaign approval controls
7. `Logs` - automation log table

## Express API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | API and Worker connection health |
| `GET` | `/api/dashboard` | Metrics, chart data, tasks, recent logs |
| `GET` | `/api/leads` | Lead list with filters |
| `POST` | `/api/leads` | Submit lead and optionally forward to Worker |
| `GET` | `/api/members` | Member retention records |
| `GET` | `/api/tasks` | Task queue |
| `POST` | `/api/tasks/:taskId/complete` | Mark task done |
| `GET` | `/api/campaigns` | Campaign approval queue |
| `POST` | `/api/campaigns/:campaignId/decision` | Approve or reject campaign |
| `GET` | `/api/logs` | Automation logs |
| `GET` | `/api/settings` | Demo settings |

## Production Shape

For a real deployment later:

- deploy the Next.js frontend to a Node-capable host
- deploy the Express backend to a Node API host
- keep the Cloudflare Worker as the public webhook router
- keep n8n reachable by public URL or a stable Cloudflare Tunnel
- keep secrets only in backend/Worker environments, never in browser code

For the free portfolio demo, local Next.js + local Express + Cloudflare Tunnel for n8n is enough.
