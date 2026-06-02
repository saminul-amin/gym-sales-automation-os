# Cloudflare Worker Setup Guide

This guide explains how to set up the Cloudflare Worker router for Gym Sales Automation OS from zero.

It assumes you are new to Cloudflare Workers. Follow it slowly. The goal is not only to deploy code, but to understand what each part is doing so you can debug it confidently.

Use this guide with:

- `src/cloudflare-worker/worker.js`
- `src/cloudflare-worker/wrangler.toml.example`
- `n8n/node-setup-guide.md`
- `postman/gym-sales-automation-os.postman_collection.json`
- `postman/gym-sales-automation-os.postman_environment.json`

## 1. What the Cloudflare Worker Does

The Worker is a small serverless API layer that sits in front of n8n.

Without the Worker, outside systems would send requests directly to n8n webhook URLs.

With the Worker, outside systems send requests to Cloudflare first:

```text
Lead form / Postman / Mock Resamania
  -> Cloudflare Worker
  -> n8n webhook
  -> Google Sheets / Gmail / OpenRouter workflows
```

This project uses the Worker for four reasons:

1. It gives you one clean public API URL.
2. It checks that incoming requests include the shared secret header.
3. It normalizes payloads before n8n receives them.
4. It routes each event to the correct n8n webhook.

The Worker is not replacing n8n. It is the front door.

## 2. Beginner Vocabulary

| Term | Meaning |
| --- | --- |
| Cloudflare Worker | A small JavaScript function hosted by Cloudflare. It runs when an HTTP request hits its URL. |
| Wrangler | Cloudflare's command-line tool for testing, deploying, and managing Workers. |
| `worker.js` | The JavaScript file that contains the Worker logic for this project. |
| `wrangler.toml` | The configuration file that tells Cloudflare the Worker name, entry file, and deployment settings. |
| Secret | A hidden environment value stored in Cloudflare, such as a webhook URL or token. |
| `workers.dev` URL | The free Cloudflare-provided public URL for your Worker. |
| Route | A path on the Worker URL, such as `/lead` or `/resamania`. |
| n8n production webhook URL | The n8n URL that works after a workflow is activated. It usually contains `/webhook/`. |
| n8n test webhook URL | The n8n URL that works only while the Webhook node is listening for a test event. It usually contains `/webhook-test/`. |

## 3. Files in This Project

### `src/cloudflare-worker/worker.js`

This is the real Worker code. It already exists.

It has three public routes:

| Worker Route | Forwards To | Purpose |
| --- | --- | --- |
| `/lead` | `N8N_LEAD_WEBHOOK_URL` | New lead intake events |
| `/resamania` | `N8N_RESAMANIA_WEBHOOK_URL` | Mock Resamania member events |
| `/interaction` | `N8N_INTERACTION_WEBHOOK_URL` | Manual or inbound interaction events |

The Worker accepts only `POST` requests, except for browser preflight `OPTIONS`.

### `src/cloudflare-worker/wrangler.toml.example`

This is a starter config file. You will copy it to:

```text
src/cloudflare-worker/wrangler.toml
```

The real `wrangler.toml` is the file Wrangler reads when you test or deploy.

## 4. What You Need Before Starting

Prepare these first:

| Item | Why You Need It |
| --- | --- |
| Cloudflare account | Required to deploy the Worker |
| Node.js and npm | Required to run Wrangler |
| n8n lead workflow built | The Worker must forward leads somewhere |
| n8n production webhook URLs | Stored as Worker secrets |
| Postman collection | Used to test the Worker after deployment |

For the first successful test, you only need Workflow 01 working in n8n.

Do not worry if Resamania or interaction workflows are not finished yet. You can still deploy the Worker and test `/lead`.

## 4A. What to Do Inside Cloudflare

If you already have a Cloudflare account, this is the part you need next.

Open:

```text
https://dash.cloudflare.com/
```

Log in and stay at the account-level dashboard. For this project, you do **not** need to open a website/domain zone unless you later want a custom domain. The free `workers.dev` URL is enough for the MVP and portfolio demo.

### The Cloudflare Areas You Will Use

In the Cloudflare dashboard, go to:

```text
Workers & Pages
```

This is where Cloudflare lists all serverless Workers and Pages projects in your account.

You will mainly use these places:

| Cloudflare Area | Where It Is | What You Do There |
| --- | --- | --- |
| `Workers & Pages > Overview` | Main Workers list | Confirm your Worker exists after deployment |
| Worker detail page | Click `gym-sales-automation-os-router` | Inspect the deployed Worker |
| `Settings > Variables and Secrets` | Inside the Worker | Add or verify webhook URLs and secret values |
| `Settings > Domains & Routes` | Inside the Worker | Confirm the `workers.dev` URL or add a custom domain later |
| `Deployments` | Inside the Worker | See deployed versions and rollback if needed |
| `Logs` or `Observability > Logs` | Inside the Worker | Debug failed requests and runtime errors |
| `Metrics` or `Observability` | Inside the Worker | See request count, errors, and basic traffic |

### Important: Do Not Create a Pages Project

Cloudflare has both:

```text
Workers
Pages
```

For this project, use:

```text
Worker
```

Do not create a Cloudflare Pages app. Pages is for hosting frontend/static websites. This project needs a Worker because it is an API router.

### Should You Create the Worker in the Dashboard First?

Recommended answer:

```text
No. Let Wrangler create it when you deploy.
```

This project already has the Worker code in:

```text
src/cloudflare-worker/worker.js
```

If you create a blank Worker manually in the dashboard, Cloudflare will create demo code first, and then you still need to replace it. That adds confusion.

The cleaner professional flow is:

```text
Local project files
  -> npx wrangler deploy
  -> Cloudflare creates/updates gym-sales-automation-os-router
  -> You verify it in Workers & Pages
```

After your first successful `npx wrangler deploy`, open:

```text
Cloudflare Dashboard > Workers & Pages > Overview
```

You should see:

```text
gym-sales-automation-os-router
```

Click it. That Worker detail page is where you inspect deployments, variables, routes, logs, and metrics.

### First-Time Workers Setup in Cloudflare

If this is your first Worker in the account, Cloudflare may ask you to choose or confirm a Workers subdomain.

It will become part of URLs like:

```text
https://gym-sales-automation-os-router.your-subdomain.workers.dev
```

Choose a simple account subdomain if Cloudflare asks. The exact name is not important for the automation to work, but keep it professional because it may appear in demos.

Examples:

```text
plugwheel-os
gym-automation-demo
yourname-lab
```

If Cloudflare does not ask, continue. Your account may already have a Workers subdomain.

### What You Do in Dashboard vs PowerShell

Use this split:

| Task | Best Place |
| --- | --- |
| Upload `worker.js` code | PowerShell with `npx wrangler deploy` |
| Log in to Cloudflare from your machine | PowerShell with `npx wrangler login` |
| Confirm the Worker exists | Cloudflare dashboard |
| Add secrets | Either PowerShell or Cloudflare dashboard |
| See the public Worker URL | Cloudflare dashboard or Wrangler deploy output |
| Test requests | Postman |
| Debug Worker errors | Cloudflare dashboard logs |
| Debug n8n workflow errors | n8n Executions |

So the dashboard is not where you build the whole automation. It is where you verify, configure, observe, and debug the deployed Worker.

## 5. Understand the End Result

After setup, your Worker URL will look similar to:

```text
https://gym-sales-automation-os-router.your-subdomain.workers.dev
```

The lead endpoint will be:

```text
https://gym-sales-automation-os-router.your-subdomain.workers.dev/lead
```

When Postman sends a lead to `/lead`, the Worker will:

1. Confirm the request is `POST`.
2. Confirm the path is `/lead`.
3. Check the `X-PlugWheel-Secret` header.
4. Parse the JSON body.
5. Add `event_id`.
6. Add `received_at`.
7. Normalize the lead data into a `lead` object.
8. Forward the event to the n8n lead intake webhook.
9. Return `202 Accepted` if n8n accepts the request.

## 5A. Free No-Paid Hosting Option

You do not need paid n8n Cloud for this portfolio project.

The free setup is:

```text
n8n runs locally on your computer
  -> Cloudflare Tunnel creates a public URL for local n8n
  -> Deployed Cloudflare Worker forwards events to that tunnel URL
  -> n8n receives the webhook on localhost through the tunnel
```

This is the recommended no-paid architecture:

| Part | Free Option | Notes |
| --- | --- | --- |
| n8n | Run locally with Docker or npm | Your computer must stay on while testing |
| Public n8n URL | Cloudflare Quick Tunnel | Free temporary `trycloudflare.com` URL |
| Worker | Cloudflare Workers Free | Enough for portfolio/demo traffic |
| Database | Google Sheets | Free for MVP usage |
| Testing | Postman | Free desktop app |

### Important Limitation

This is not a permanent production hosting setup.

It is excellent for:

- Portfolio demos
- Development
- Recording walkthrough videos
- Testing Worker-to-n8n webhooks without paying for n8n Cloud

It is not ideal for:

- A real client production system
- Always-on automation
- Workflows that must run while your computer is off

If your computer sleeps or the tunnel stops, the deployed Worker cannot reach n8n.

### Option 1: Quick Tunnel for Free Testing

This is the easiest no-paid option.

Keep n8n running locally:

```text
http://localhost:5678
```

Then install and run `cloudflared`.

### Install `cloudflared` on Windows

The command below works only after the `cloudflared` program is installed.

If PowerShell says:

```text
cloudflared : The term 'cloudflared' is not recognized
```

it means Windows cannot find the `cloudflared` executable yet.

Recommended install method on Windows:

```powershell
winget install --id Cloudflare.cloudflared
```

After installation:

1. Close PowerShell.
2. Open a new PowerShell window.
3. Check that Windows can find it:

```powershell
cloudflared --version
```

If that prints a version, continue.

Alternative manual method:

1. Download the Windows 64-bit `cloudflared` executable from Cloudflare's official downloads page.
2. Rename it to:

```text
cloudflared.exe
```

3. Put it in a folder such as:

```text
C:\Cloudflared\bin
```

4. Either add that folder to your Windows `Path`, or run it with the full path:

```powershell
C:\Cloudflared\bin\cloudflared.exe tunnel --url http://localhost:5678
```

If you downloaded `cloudflared.exe` into the current folder, run it like this:

```powershell
.\cloudflared.exe tunnel --url http://localhost:5678
```

### Run the Quick Tunnel

From a new PowerShell window:

```powershell
cloudflared tunnel --url http://localhost:5678
```

Cloudflare will print a public URL similar to:

```text
https://random-words-example.trycloudflare.com
```

Your n8n lead webhook URL becomes:

```text
https://random-words-example.trycloudflare.com/webhook/lead-intake
```

Put that value into the deployed Worker secret:

```text
N8N_LEAD_WEBHOOK_URL
```

Do not use:

```text
http://localhost:5678/webhook/lead-intake
```

for the deployed Worker.

### Exact Free Testing Flow

Use this flow when you do not want to pay for n8n hosting:

1. Start n8n locally.
2. Activate workflow `01 - Lead Intake and Qualification`.
3. Start Cloudflare Tunnel:

```powershell
cloudflared tunnel --url http://localhost:5678
```

4. Copy the generated `https://...trycloudflare.com` URL.
5. In Cloudflare Worker secrets, set:

```text
N8N_LEAD_WEBHOOK_URL=https://YOUR-TUNNEL.trycloudflare.com/webhook/lead-intake
```

6. Make sure `N8N_OUTBOUND_TOKEN` is not set for the first test.
7. Redeploy or save/deploy the Worker secret change.
8. Send the Postman request to the deployed Worker `/lead` route.

Expected:

```text
Postman -> deployed Worker -> Cloudflare Tunnel -> local n8n
```

### Quick Tunnel URL Changes

Quick Tunnel URLs are temporary.

Every time you stop and restart:

```powershell
cloudflared tunnel --url http://localhost:5678
```

Cloudflare may give you a new URL.

When that happens, update this Worker secret again:

```text
N8N_LEAD_WEBHOOK_URL
```

For a portfolio demo, this is fine. Start the tunnel, update the secret, test, then record the walkthrough.

### Option 2: Named Tunnel

A named Cloudflare Tunnel can give you a more stable URL, but it usually requires a domain connected to Cloudflare.

Use this only if you already own a domain or have access to one.

If you do not own a domain and cannot spend money, use Quick Tunnel.

## 6. Get Your n8n Webhook URLs

This is the most common beginner confusion, so pause here.

n8n has two webhook URL styles:

| URL Type | Example | When It Works |
| --- | --- | --- |
| Test URL | `https://your-n8n.com/webhook-test/lead-intake` | Only while you click `Listen for test event` |
| Production URL | `https://your-n8n.com/webhook/lead-intake` | Only after the workflow is activated |

For a deployed Cloudflare Worker, use production URLs.

### Lead Workflow URL

In n8n:

1. Open workflow `01 - Lead Intake and Qualification`.
2. Open the `Lead Intake Webhook` node.
3. Confirm the path is:

```text
lead-intake
```

4. Activate the workflow.
5. Copy the production URL.
6. Save it as the value for:

```text
N8N_LEAD_WEBHOOK_URL
```

It should look like:

```text
https://your-n8n-domain.com/webhook/lead-intake
```

### Resamania Workflow 03 Route A URL

Use this after Workflow 03, Route A, `Resamania Event Webhook`, is built.

The path from the n8n guide is:

```text
resamania-event
```

Save its production URL as:

```text
N8N_RESAMANIA_WEBHOOK_URL
```

It should look like:

```text
https://your-n8n-domain.com/webhook/resamania-event
```

### Interaction Workflow URL

Use this only when you create the interaction webhook workflow.

The placeholder path used by this project is:

```text
interaction-event
```

Save its production URL as:

```text
N8N_INTERACTION_WEBHOOK_URL
```

It should look like:

```text
https://your-n8n-domain.com/webhook/interaction-event
```

If you have not built this workflow yet, you can still test `/lead`. The `/interaction` route will not work until this secret points to a real n8n webhook.

## 7. Generate the Shared Secret

The shared secret is a private value that callers must send in this header:

```text
X-PlugWheel-Secret
```

The Worker compares that header to:

```text
WEBHOOK_SHARED_SECRET
```

If they do not match, the Worker returns:

```text
401 Unauthorized
```

### Generate a Secret in PowerShell

Run this in PowerShell:

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Copy the output. It will look random, like:

```text
mZ9nJg7lF4uLzP4yBqK6l1oD5g3Qh8pZc2sR0xYv9A=
```

Use your own generated value, not the example.

You will put the same value in two places:

1. Cloudflare secret: `WEBHOOK_SHARED_SECRET`
2. Postman environment variable: `worker_secret`

## 8. Open the Worker Folder

Open PowerShell in the project root:

```powershell
cd "E:\WorkBench\plugwheel\Gym Sales Automation OS"
```

Then move into the Worker folder:

```powershell
cd .\src\cloudflare-worker
```

Most Wrangler commands in this guide should be run from:

```text
src/cloudflare-worker
```

This matters. If your PowerShell prompt still shows the project root:

```text
PS E:\WorkBench\plugwheel\Gym Sales Automation OS>
```

and you run:

```powershell
npx wrangler dev
```

Wrangler will not see `src/cloudflare-worker/wrangler.toml`. It will show an error like:

```text
Missing entry-point to Worker script or to assets directory
```

Correct prompt before running raw Wrangler commands:

```text
PS E:\WorkBench\plugwheel\Gym Sales Automation OS\src\cloudflare-worker>
```

Alternative from the project root:

```powershell
npm.cmd run worker:dev
```

That script changes into the correct folder first.

## 9. Check Node.js and npm

Run:

```powershell
node --version
npm --version
```

If both commands print versions, continue.

If one command is not recognized, install Node.js first:

```text
https://nodejs.org/
```

Use the LTS version unless you already know you need something else.

## 10. Install Wrangler

Cloudflare recommends installing Wrangler locally in the project so the project controls which Wrangler version it uses.

From `src/cloudflare-worker`, run:

```powershell
npm init -y
npm install --save-dev wrangler@latest
```

Then confirm Wrangler works:

```powershell
npx wrangler --version
```

Expected result:

```text
wrangler x.y.z
```

The exact version number does not matter as long as the command works.

## 11. Create `wrangler.toml`

Still inside `src/cloudflare-worker`, copy the example file:

```powershell
Copy-Item -LiteralPath .\wrangler.toml.example -Destination .\wrangler.toml
```

Open:

```text
src/cloudflare-worker/wrangler.toml
```

Confirm it contains:

```toml
name = "gym-sales-automation-os-router"
main = "worker.js"
compatibility_date = "2026-05-25"
workers_dev = true

[vars]
APP_NAME = "Gym Sales Automation OS"
```

The important fields are:

| Field | Meaning |
| --- | --- |
| `name` | The Worker name inside Cloudflare |
| `main` | The JavaScript file Cloudflare deploys |
| `compatibility_date` | The Workers runtime behavior date |
| `workers_dev` | Enables the free `workers.dev` public URL |
| `[vars]` | Non-secret environment variables |

Do not put webhook URLs or tokens in `[vars]`. Those should be secrets.

Your `wrangler.toml` should keep only non-sensitive public configuration in `[vars]`, for example:

```toml
[vars]
APP_NAME = "Gym Sales Automation OS"
```

Do not put these in `wrangler.toml`:

```text
WEBHOOK_SHARED_SECRET
N8N_LEAD_WEBHOOK_URL
N8N_RESAMANIA_WEBHOOK_URL
N8N_INTERACTION_WEBHOOK_URL
N8N_OUTBOUND_TOKEN
```

Use `.dev.vars` for local testing and Cloudflare Secrets for deployed production.

## 12. Log In to Cloudflare from Wrangler

Run:

```powershell
npx wrangler login
```

What should happen:

1. Wrangler opens your browser.
2. Cloudflare asks you to log in.
3. Cloudflare asks you to authorize Wrangler.
4. You approve.
5. Return to PowerShell.

Confirm login:

```powershell
npx wrangler whoami
```

If it shows your Cloudflare email/account, you are logged in.

## 13. Optional Local Test Before Deploying

This step is useful, but not required.

Create a local secret file:

```text
src/cloudflare-worker/.dev.vars
```

### Where These Values Come From

These values do not all come from Cloudflare.

| Variable | Where You Get It | What to Put |
| --- | --- | --- |
| `WEBHOOK_SHARED_SECRET` | You generate it yourself | A long random secret from Step 7 |
| `N8N_LEAD_WEBHOOK_URL` | n8n | Production webhook URL from Workflow 01, path `lead-intake` |
| `N8N_RESAMANIA_WEBHOOK_URL` | n8n | Production webhook URL from Workflow 03, Route A, path `resamania-event` |
| `N8N_INTERACTION_WEBHOOK_URL` | n8n | Production webhook URL from the interaction-event route, path `interaction-event` |
| `N8N_OUTBOUND_TOKEN` | You create it only if securing n8n webhooks | Leave empty for the beginner MVP |

Important distinction:

| File or Place | Use It For | Can It Use `localhost`? |
| --- | --- | --- |
| `.dev.vars` | Local `npx wrangler dev` testing on your computer | Yes, if n8n also runs on your computer |
| Cloudflare Worker Secrets | Deployed Worker running on Cloudflare | No |
| `wrangler.toml` `[vars]` | Non-secret public configuration only | Do not put n8n URLs here |

For a deployed Worker, `N8N_LEAD_WEBHOOK_URL` must be a public URL, for example:

```text
https://your-workspace.app.n8n.cloud/webhook/lead-intake
```

or:

```text
https://n8n.yourdomain.com/webhook/lead-intake
```

Do not use this in deployed Cloudflare secrets:

```text
http://localhost:5678/webhook/lead-intake
```

From Cloudflare's server, `localhost` means Cloudflare's own runtime environment, not your computer.

The most important one for your first test is:

```text
N8N_LEAD_WEBHOOK_URL
```

That comes from n8n:

1. Open n8n.
2. Open workflow `01 - Lead Intake and Qualification`.
3. Open the `Lead Intake Webhook` node.
4. Make sure the path is `lead-intake`.
5. Activate the workflow.
6. Copy the `Production URL`, not the test URL.

It should look like:

```text
https://your-n8n-domain.com/webhook/lead-intake
```

If you are testing locally with `npx wrangler dev`, you may use the n8n `Test URL` temporarily, but only while the n8n Webhook node is actively listening for a test event.

If you are deploying the Worker to Cloudflare, do not use `localhost` n8n URLs. Cloudflare cannot call your computer's `localhost`. Use a public n8n URL from n8n Cloud, a public self-hosted n8n instance, or a tunnel you intentionally set up.

### Minimal `.dev.vars` for Testing Only Workflow 01

If only Workflow 01 is built right now, use this:

```text
WEBHOOK_SHARED_SECRET="paste-your-generated-secret-here"
N8N_LEAD_WEBHOOK_URL="https://your-n8n-domain.com/webhook/lead-intake"
N8N_RESAMANIA_WEBHOOK_URL=""
N8N_INTERACTION_WEBHOOK_URL=""
N8N_OUTBOUND_TOKEN=""
```

With this setup, only the Worker `/lead` route is ready. The `/resamania` and `/interaction` routes will return a missing URL error until you add their n8n webhook URLs.

### Full `.dev.vars` After All Webhook Workflows Exist

After the related n8n workflows are built, use this structure:

```text
WEBHOOK_SHARED_SECRET="paste-your-generated-secret-here"
N8N_LEAD_WEBHOOK_URL="https://your-n8n-domain.com/webhook/lead-intake"
N8N_RESAMANIA_WEBHOOK_URL="https://your-n8n-domain.com/webhook/resamania-event"
N8N_INTERACTION_WEBHOOK_URL="https://your-n8n-domain.com/webhook/interaction-event"
N8N_OUTBOUND_TOKEN=""
```

Important:

- Do not commit `.dev.vars`.
- Use production n8n webhook URLs if your n8n workflows are active.
- Use test n8n webhook URLs only if you are actively listening for a test event in n8n.

Start the local Worker:

```powershell
npx wrangler dev
```

Run that command only when your terminal is already inside:

```text
src/cloudflare-worker
```

If your terminal is still at the project root, run this instead:

```powershell
npm.cmd run worker:dev
```

Wrangler normally serves the Worker at:

```text
http://localhost:8787
```

Test the local lead route with PowerShell:

```powershell
$headers = @{
  "Content-Type" = "application/json"
  "X-PlugWheel-Secret" = "paste-your-generated-secret-here"
}

$body = @{
  event_type = "lead.created"
  source = "worker-local-test"
  name = "Claire Martin"
  email = "claire@example.com"
  phone = "+33601020304"
  message = "Bonjour, je voudrais faire une seance d'essai cette semaine."
  fitness_goal = "weight_loss"
  interested_service = "personal_training"
  preferred_channel = "email"
  consent_status = "yes"
  opted_out = $false
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:8787/lead" `
  -Headers $headers `
  -Body $body
```

Expected response:

```json
{
  "ok": true,
  "event_id": "some-generated-id",
  "event_type": "lead.created"
}
```

If you get this response, the Worker accepted the event and n8n accepted the forwarded webhook request.

Stop local Wrangler with:

```text
Ctrl + C
```

## 14. Deploy the Worker

From `src/cloudflare-worker`, run:

```powershell
npx wrangler deploy
```

Wrangler will upload the Worker to Cloudflare.

At the end, it should print a public URL similar to:

```text
https://gym-sales-automation-os-router.your-subdomain.workers.dev
```

Save this value. It is your:

```text
worker_base_url
```

Use it in Postman.

### Verify the Deployment in Cloudflare Dashboard

After the deploy command succeeds, go back to Cloudflare:

```text
Cloudflare Dashboard > Workers & Pages > Overview
```

Find and click:

```text
gym-sales-automation-os-router
```

Check these areas:

| Dashboard Area | What to Confirm |
| --- | --- |
| `Overview` | The Worker exists and shows recent deployment activity |
| `Deployments` | The latest deployment is successful |
| `Settings > Domains & Routes` | A `workers.dev` URL exists or is enabled |
| `Settings > Variables and Secrets` | Secrets can be added here if you do not want to use CLI |
| `Logs` or `Observability > Logs` | This is where request errors will appear after testing |

If you do not see the Worker in `Workers & Pages`, check that `npx wrangler deploy` finished successfully and that Wrangler is logged into the same Cloudflare account you are viewing in the browser.

## 15. Add Production Secrets

Cloudflare secrets are hidden values available to your Worker through the `env` object.

You can add secrets in either place:

| Method | Recommended For |
| --- | --- |
| PowerShell with `npx wrangler secret put` | Fast setup while following this guide |
| Cloudflare dashboard | Visual confirmation and manual editing |

Use one method. You do not need to do both.

### Method A: Add Secrets with PowerShell

Run these commands from `src/cloudflare-worker`.

### Required Secret 1: Shared Secret

```powershell
npx wrangler secret put WEBHOOK_SHARED_SECRET
```

When prompted, paste the generated secret from Step 7.

### Required Secret 2: Lead n8n Webhook URL

```powershell
npx wrangler secret put N8N_LEAD_WEBHOOK_URL
```

Paste your n8n production lead webhook URL:

```text
https://your-n8n-domain.com/webhook/lead-intake
```

### Required Later: Resamania n8n Webhook URL

Set this when Workflow 03, Route A, exists:

```powershell
npx wrangler secret put N8N_RESAMANIA_WEBHOOK_URL
```

Paste:

```text
https://your-n8n-domain.com/webhook/resamania-event
```

### Required Later: Interaction n8n Webhook URL

Set this when your interaction-event route exists:

```powershell
npx wrangler secret put N8N_INTERACTION_WEBHOOK_URL
```

Paste:

```text
https://your-n8n-domain.com/webhook/interaction-event
```

### Optional Secret: n8n Outbound Token

This project's Worker can send an Authorization header to n8n if `N8N_OUTBOUND_TOKEN` exists.

For the beginner MVP, skip this unless you have configured n8n webhook authentication.

If you later add token authentication in n8n, run:

```powershell
npx wrangler secret put N8N_OUTBOUND_TOKEN
```

Then paste the token value.

### Method B: Add Secrets in Cloudflare Dashboard

Use this if you prefer clicking inside Cloudflare instead of using `wrangler secret put`.

In Cloudflare:

1. Go to `Workers & Pages`.
2. Click `gym-sales-automation-os-router`.
3. Open `Settings`.
4. Find `Variables and Secrets`.
5. Click `Add`.
6. Choose `Secret` as the type.
7. Enter the variable name exactly.
8. Paste the value.
9. Save it.
10. Click `Deploy` if Cloudflare asks you to deploy the variable changes.

Add these as `Secret`, not plain text variables:

| Secret Name | Value to Paste |
| --- | --- |
| `WEBHOOK_SHARED_SECRET` | The random secret you generated |
| `N8N_LEAD_WEBHOOK_URL` | n8n production URL for `/webhook/lead-intake` |
| `N8N_RESAMANIA_WEBHOOK_URL` | n8n production URL for `/webhook/resamania-event` |
| `N8N_INTERACTION_WEBHOOK_URL` | n8n production URL for `/webhook/interaction-event` |
| `N8N_OUTBOUND_TOKEN` | Optional token only if your n8n webhook requires it |

If Workflow 03 Route A or the interaction-event route is not built yet, you can skip those two URL secrets temporarily. The `/lead` route only needs:

```text
WEBHOOK_SHARED_SECRET
N8N_LEAD_WEBHOOK_URL
```

When you add a skipped workflow later, return to:

```text
Workers & Pages > gym-sales-automation-os-router > Settings > Variables and Secrets
```

Then add the missing secret.

## 16. Deploy Again After Secrets

After secrets are added, deploy again:

```powershell
npx wrangler deploy
```

This ensures the latest code and configuration are live together.

If you added secrets through the Cloudflare dashboard and Cloudflare already asked you to deploy those changes, running `npx wrangler deploy` again is still fine. It will redeploy the same Worker code from your local project.

## 17. Test with Postman

Open Postman and import:

```text
postman/gym-sales-automation-os.postman_collection.json
postman/gym-sales-automation-os.postman_environment.json
```

Select the environment:

```text
Gym Sales Automation OS - Local and Cloud
```

Set these variables:

| Variable | Value |
| --- | --- |
| `worker_base_url` | Your deployed Worker URL, without a trailing slash |
| `worker_secret` | The same value as `WEBHOOK_SHARED_SECRET` |
| `n8n_base_url` | Your n8n base URL |
| `n8n_webhook_prefix` | `webhook` for active workflows, `webhook-test` for manual test listening |

Example:

```text
worker_base_url = https://gym-sales-automation-os-router.your-subdomain.workers.dev
worker_secret = paste-your-generated-secret-here
n8n_base_url = https://your-n8n-domain.com
n8n_webhook_prefix = webhook
```

Run this request:

```text
01 - Cloudflare Worker Router / Worker - Lead Happy Path
```

Expected Worker response:

```json
{
  "ok": true,
  "event_id": "generated-id",
  "event_type": "lead.created"
}
```

Expected HTTP status:

```text
202 Accepted
```

## 18. Verify in n8n

After Postman returns `202`, check n8n:

1. Open workflow `01 - Lead Intake and Qualification`.
2. Go to `Executions`.
3. Confirm a new execution exists.
4. Open the execution.
5. Confirm the Webhook node received a normalized payload.
6. Confirm the workflow reached a `Respond to Webhook` node.

Then check Google Sheets:

1. Open the CRM sheet.
2. Check the `Leads` tab.
3. Check the `Interactions` tab.
4. Check the `Automation Logs` tab.

For a happy path lead with consent, you should see:

- Lead saved or updated
- AI qualification values saved
- Email sent or queued depending on route
- Interaction logged
- Automation logged

## 18A. Verify in Cloudflare Dashboard

After Postman sends a request, also check Cloudflare:

```text
Workers & Pages > gym-sales-automation-os-router
```

Look at:

| Dashboard Area | What It Tells You |
| --- | --- |
| `Metrics` or `Observability` | Whether requests are reaching the Worker |
| `Logs` | Runtime errors, rejected requests, and console output |
| `Deployments` | Which Worker version is currently live |
| `Settings > Variables and Secrets` | Whether the required secret names exist |
| `Settings > Domains & Routes` | Whether the public Worker URL is connected |

If Postman cannot reach the Worker at all, check `Settings > Domains & Routes`.

If Postman reaches the Worker but gets `401`, check `Variables and Secrets` and Postman's `worker_secret`.

If Postman reaches the Worker but gets `502`, check n8n `Executions`. That means the Worker ran, but n8n rejected or failed the forwarded webhook request.

## 19. Test Failure Cases

Professional setup means testing both success and failure.

### Wrong Secret

Send the Postman request with a wrong `worker_secret`.

Expected:

```text
401 Unauthorized
```

Meaning:

```text
The Worker protected n8n correctly.
```

### Missing Lead Name

Remove `name` from the lead payload.

Expected:

```text
422 Unprocessable Entity
```

Meaning:

```text
The Worker rejected an invalid lead before n8n spent time on it.
```

### Unknown Route

Send a request to:

```text
/unknown
```

Expected:

```text
404 Unknown route
```

### n8n Workflow Inactive

If the Worker returns:

```text
502 n8n webhook rejected event
```

The most common reason is that the n8n production webhook is not active.

Fix:

1. Open the n8n workflow.
2. Activate it.
3. Confirm the stored URL uses `/webhook/`, not `/webhook-test/`.
4. Retry the Postman request.

## 20. How the Worker Normalizes Lead Payloads

Postman can send a flat lead payload:

```json
{
  "event_type": "lead.created",
  "source": "website",
  "name": "Claire Martin",
  "email": "claire@example.com",
  "phone": "+33601020304",
  "message": "Bonjour, je voudrais faire une seance d'essai cette semaine.",
  "fitness_goal": "weight_loss",
  "interested_service": "personal_training",
  "preferred_channel": "email",
  "consent_status": "yes",
  "opted_out": false
}
```

n8n receives a normalized event:

```json
{
  "event_id": "generated-id",
  "event_type": "lead.created",
  "received_at": "2026-05-27T00:00:00.000Z",
  "source": "website",
  "lead": {
    "name": "Claire Martin",
    "email": "claire@example.com",
    "phone": "+33601020304",
    "original_message": "Bonjour, je voudrais faire une seance d'essai cette semaine.",
    "fitness_goal": "weight_loss",
    "interested_service": "personal_training",
    "preferred_channel": "email",
    "consent_status": "yes",
    "opted_out": false
  },
  "raw": {
    "event_type": "lead.created",
    "source": "website"
  }
}
```

This is why the n8n workflow can read:

```text
$json.body.lead.name
```

or, after the normalize node:

```text
lead.name
```

## 21. When to Use Test URLs vs Production URLs

Use this rule:

| Situation | Use |
| --- | --- |
| Testing n8n directly while clicking `Listen for test event` | `/webhook-test/...` |
| Testing local Worker with n8n listening for one test event | `/webhook-test/...` |
| Testing deployed Worker | `/webhook/...` |
| Portfolio demo | `/webhook/...` |
| Anything that should keep working without the n8n editor open | `/webhook/...` |

If you put a test URL in Cloudflare secrets, the Worker may work once while n8n is listening and then fail later. For the deployed Worker, production URLs are the professional choice.

## 22. Updating the Worker Later

Whenever you edit:

```text
src/cloudflare-worker/worker.js
```

Run a quick syntax check from the project root:

```powershell
node --check .\src\cloudflare-worker\worker.js
```

Then deploy from the Worker folder:

```powershell
cd .\src\cloudflare-worker
npx wrangler deploy
```

Then retest with Postman.

## 23. Troubleshooting

### `node` Is Not Recognized

Node.js is not installed or not available in your terminal.

Fix:

1. Install Node.js LTS.
2. Close PowerShell.
3. Open PowerShell again.
4. Run `node --version`.

### `npx wrangler login` Does Not Open Browser

Copy the login URL from the terminal and paste it into your browser manually.

After approving access, return to PowerShell.

### `cloudflared` Is Not Recognized in PowerShell

Cause:

`cloudflared` is not installed, or it is installed but its folder is not in the Windows `Path`.

Fix option A with winget:

```powershell
winget install --id Cloudflare.cloudflared
```

Then close PowerShell, open it again, and run:

```powershell
cloudflared --version
```

Fix option B with manual download:

1. Download the Windows 64-bit executable from Cloudflare's `cloudflared` downloads page.
2. Rename it to `cloudflared.exe`.
3. Put it in `C:\Cloudflared\bin`.
4. Run:

```powershell
C:\Cloudflared\bin\cloudflared.exe tunnel --url http://localhost:5678
```

If the file is in your current folder, run:

```powershell
.\cloudflared.exe tunnel --url http://localhost:5678
```

### Wrangler Shows `Missing entry-point to Worker script or to assets directory`

Cause:

Wrangler is being run from the wrong folder. In this project, `wrangler.toml` is here:

```text
src/cloudflare-worker/wrangler.toml
```

If you run `npx wrangler dev` from the project root, Wrangler cannot find that config file and does not know that the Worker entry file is:

```text
src/cloudflare-worker/worker.js
```

Fix option A:

```powershell
cd "E:\WorkBench\plugwheel\Gym Sales Automation OS\src\cloudflare-worker"
npx wrangler dev
```

Fix option B from the project root:

```powershell
npm.cmd run worker:dev
```

If you see this after the main Wrangler error:

```text
Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)
```

treat it as a secondary Wrangler/Node shutdown crash caused after the configuration error. Fix the missing entry-point problem first. If it still appears after running from the correct folder, close PowerShell, reopen it, and run the command again.

### Worker Returns `401 Unauthorized`

Cause:

```text
X-PlugWheel-Secret does not match WEBHOOK_SHARED_SECRET.
```

For local `wrangler dev`, the Worker reads `WEBHOOK_SHARED_SECRET` from:

```text
src/cloudflare-worker/.dev.vars
```

For deployed Cloudflare, the Worker reads it from:

```text
Workers & Pages > gym-sales-automation-os-router > Settings > Variables and Secrets
```

Fix:

1. Open `src/cloudflare-worker/.dev.vars`.
2. Copy the value inside `WEBHOOK_SHARED_SECRET="..."`.
3. In Postman, select the correct environment.
4. Set `worker_secret` to that exact value.
5. Make sure the request header is named exactly:

```text
X-PlugWheel-Secret
```

6. Make sure the request header value is exactly:

```text
{{worker_secret}}
```

Common mistakes:

- Leaving Postman's `worker_secret` as `replace-with-worker-shared-secret`
- Including the quote marks from `.dev.vars`
- Adding an extra space before or after the secret
- Selecting the wrong Postman environment
- Sending the intentional negative test request named `Worker - Bad Secret Negative Test`

### Worker Returns `400 Invalid JSON body`

Cause:

The request body is not valid JSON.

Fix in Postman:

1. Go to `Body`.
2. Select `raw`.
3. Select `JSON`.
4. Confirm the body has valid JSON syntax.

### Worker Returns `422 Lead name is required`

Cause:

The lead payload is missing a name.

Fix:

Add:

```json
{
  "name": "Claire Martin"
}
```

### Worker Returns `500 Missing N8N_LEAD_WEBHOOK_URL`

Cause:

The Cloudflare secret was not set.

Fix:

```powershell
npx wrangler secret put N8N_LEAD_WEBHOOK_URL
npx wrangler deploy
```

### Worker Returns `502 n8n webhook rejected event`

Common causes:

- n8n workflow is inactive
- Cloudflare secret points to a test URL
- n8n test webhook is not listening
- Wrong n8n path
- n8n workflow returned an error before responding

Fix:

1. Activate the n8n workflow.
2. Use the production URL with `/webhook/`.
3. Open n8n `Executions`.
4. Check the failed execution.
5. Correct the failed n8n node.

### Worker Says n8n Rejected Event with `"status": 404`

Example response:

```json
{
  "error": "n8n webhook rejected event",
  "event_id": "generated-id",
  "status": 404
}
```

Meaning:

The Worker worked. It accepted the secret, parsed the JSON, and sent the event to n8n. The `404` came from n8n, not Cloudflare.

Most likely causes:

| Cause | Fix |
| --- | --- |
| You used `/webhook/lead-intake`, but the n8n workflow is not active | Activate workflow `01 - Lead Intake and Qualification` |
| You are testing with `Listen for test event`, but `.dev.vars` uses `/webhook/lead-intake` | Change local `.dev.vars` to `/webhook-test/lead-intake` while listening |
| The Webhook node path is not exactly `lead-intake` | Open the n8n Webhook node and correct the path |
| You copied the wrong n8n webhook URL | Copy the URL again from the exact `Lead Intake Webhook` node |

Use this rule:

| n8n Mode | `.dev.vars` URL |
| --- | --- |
| Workflow is active | `http://localhost:5678/webhook/lead-intake` |
| Webhook node is listening for one test event | `http://localhost:5678/webhook-test/lead-intake` |

For local testing, both URLs can use `localhost` if n8n is running on the same computer. For a deployed Cloudflare Worker, do not use `localhost`.

After changing `.dev.vars`, stop and restart Wrangler:

```text
Ctrl + C
```

Then:

```powershell
npx wrangler dev
```

Wrangler may not pick up changed environment values until it restarts.

### Worker Says n8n Rejected Event with `"status": 403`

Example response:

```json
{
  "error": "n8n webhook rejected event",
  "event_id": "generated-id",
  "status": 403
}
```

Meaning:

The Worker worked. It accepted the request and reached the n8n URL. n8n, or a security layer in front of n8n, refused the forwarded request.

Most likely cause:

```text
n8n webhook authentication does not match what the Worker is sending.
```

For the beginner MVP, use this simplest setup first:

1. Open n8n workflow `01 - Lead Intake and Qualification`.
2. Open the `Lead Intake Webhook` node.
3. Set `Authentication` to `None`.
4. Save the workflow.
5. Activate the workflow.
6. In Cloudflare Worker secrets, remove or do not set `N8N_OUTBOUND_TOKEN`.
7. Deploy/redeploy the Worker.
8. Test again from Postman.

Only add n8n webhook authentication after the basic Worker-to-n8n connection works.

If you intentionally enabled n8n Header Auth, the current Worker sends this header:

```text
Authorization: Bearer YOUR_N8N_OUTBOUND_TOKEN
```

So your n8n Webhook node must be configured to expect exactly:

| n8n Header Auth Field | Value |
| --- | --- |
| Header Name | `Authorization` |
| Header Value | `Bearer YOUR_N8N_OUTBOUND_TOKEN` |

If your n8n Header Auth expects a different header, such as:

```text
X-N8N-Webhook-Token
```

the current Worker will not match it and n8n will return `403`.

Other possible causes:

| Cause | What to Check |
| --- | --- |
| Deployed Worker points to `localhost` | Cloudflare cannot call your computer's `localhost`; use a public n8n URL |
| n8n URL was placed in `wrangler.toml` `[vars]` | Remove webhook URLs from `wrangler.toml`; use Cloudflare Secrets instead |
| n8n is behind Cloudflare Access | The Worker needs Cloudflare Access service-token headers, or Access must bypass the webhook path |
| n8n is behind another reverse proxy | The proxy may block requests without an expected header/IP |
| n8n webhook URL points to the editor/API instead of the webhook endpoint | URL must contain `/webhook/lead-intake` |
| n8n production workflow was changed after activation | Save and reactivate the workflow |

Quick isolation test:

1. Copy `N8N_LEAD_WEBHOOK_URL`.
2. Send the same lead payload directly to that n8n URL from Postman.
3. If direct Postman also returns `403`, the problem is n8n or its security layer.
4. If direct Postman works but Worker returns `403`, compare the headers Postman sends directly with the headers the Worker sends.

### Root URL Returns `404 Unknown route`

This is normal.

The Worker does not have a homepage. Use one of these paths:

```text
/lead
/resamania
/interaction
```

## 24. Security Notes

For this MVP, the Worker uses a shared secret header.

That is acceptable for:

- Postman testing
- server-to-server webhook calls
- portfolio demos where the secret is not shown

Be careful with public website forms. If you put `X-PlugWheel-Secret` inside frontend JavaScript, visitors can see it. For a real public form, add a safer pattern later, such as:

- a trusted backend form handler
- Cloudflare Turnstile
- stricter origin checks
- rate limiting
- request schema validation
- narrower CORS rules instead of `Access-Control-Allow-Origin: *`

Do not show these values in screenshots:

- `WEBHOOK_SHARED_SECRET`
- n8n production webhook URLs
- `N8N_OUTBOUND_TOKEN`
- OpenRouter API keys

## 25. Beginner Completion Checklist

You are done when all of these are true:

1. `node --version` works.
2. `npx wrangler --version` works.
3. `wrangler.toml` exists inside `src/cloudflare-worker`.
4. `npx wrangler whoami` shows your Cloudflare account.
5. `npx wrangler deploy` returns a `workers.dev` URL.
6. Cloudflare dashboard shows `Workers & Pages > gym-sales-automation-os-router`.
7. `Settings > Domains & Routes` shows the public Worker URL.
8. `Settings > Variables and Secrets` contains `WEBHOOK_SHARED_SECRET`.
9. `Settings > Variables and Secrets` contains `N8N_LEAD_WEBHOOK_URL`.
10. Workflow 01 is active in n8n.
11. Postman `worker_base_url` is your Worker URL.
12. Postman `worker_secret` matches the Cloudflare shared secret.
13. `Worker - Lead Happy Path` returns `202`.
14. n8n shows a successful execution.
15. Google Sheets receives the lead/log rows.

## 26. Official References

Use these if Cloudflare changes the UI or Wrangler output:

- Cloudflare Wrangler overview: https://developers.cloudflare.com/workers/wrangler/
- Install or update Wrangler: https://developers.cloudflare.com/workers/wrangler/install-and-update/
- Local development with `wrangler dev`: https://developers.cloudflare.com/workers/development-testing/#local-development
- Worker commands, including `dev`, `deploy`, and `secret put`: https://developers.cloudflare.com/workers/wrangler/commands/workers/
- Environment variables and secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Wrangler configuration: https://developers.cloudflare.com/workers/wrangler/configuration/
