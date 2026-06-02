# Complete Implementation Guidelines

This guide explains exactly what to build, in what order, and how each part should work for the n8n version of Gym Sales Automation OS.

## 1. Final MVP Goal

Build a working gym automation demo where:

1. A lead comes in from a form/webhook.
2. Cloudflare Worker validates and routes the lead to n8n.
3. n8n saves or updates the lead in Google Sheets.
4. n8n calls OpenRouter to qualify the lead.
5. The AI returns structured JSON.
6. n8n updates the CRM row with lead score, temperature, summary, and next action.
7. If consent allows, n8n sends or queues a French follow-up message.
8. Every action is written to `Interactions` and `Automation Logs`.
9. The owner can see pipeline, tasks, member risk, approvals, and logs in a dashboard.

The first milestone is one complete automated lead journey. Do not polish every lifecycle workflow before lead intake works end to end.

## 2. Recommended Build Order

Build in this order:

1. Google Sheets CRM
2. n8n credentials
3. n8n webhook workflows
4. Cloudflare Worker router
5. OpenRouter HTTP Request node
6. Workflow 01: Lead intake and qualification
7. Dashboard views
8. Booking follow-up
9. New member onboarding
10. Retention risk detection
11. Review request flow
12. Reactivation campaign
13. Upsell approval queue
14. Portfolio screenshots and walkthrough

### No-Paid Hosting Note

If you cannot pay for n8n Cloud or a VPS, keep n8n local and expose it temporarily with Cloudflare Tunnel.

Free demo architecture:

```text
Local n8n on your computer
  -> Cloudflare Tunnel public trycloudflare.com URL
  -> Cloudflare Worker forwards webhook events to the tunnel URL
```

This is acceptable for a portfolio demo, but your computer, n8n, and the tunnel must stay running while you test or record the walkthrough.

## 3. Account Setup

Create or prepare these accounts:

| Tool | Purpose |
| --- | --- |
| n8n Cloud or self-hosted n8n | Workflow automation |
| OpenRouter | AI classification and message generation |
| Cloudflare | Webhook router using Workers |
| Google Sheets | CRM/database for MVP |
| Google Calendar | Trial booking and reminders |
| Gmail or Brevo | Email sending |

Store credentials safely. Do not paste API keys into public screenshots, docs, or portfolio videos.

## 4. Google Sheets Setup

Create a Google Sheet named:

```text
Gym Sales Automation OS - CRM
```

Create these tabs:

1. `Leads`
2. `Members`
3. `Interactions`
4. `Automation Logs`
5. `Campaigns`
6. `Tasks`
7. `Settings`
8. `Dashboard`

Use the schema from:

```text
docs/google-sheets-schema.md
```

For exact n8n nodes, mappings, filters, and error-handler details, use:

```text
n8n/node-setup-guide.md
```

### Settings Rows to Add First

| setting_name | value | description |
| --- | --- | --- |
| `OPENROUTER_MODEL` | your chosen model | Main AI model |
| `OPENROUTER_FALLBACK_MODEL` | fallback model | Used if main model fails |
| `GOOGLE_REVIEW_URL` | review link | Google review link |
| `REVIEW_COOLDOWN_DAYS` | `90` | Prevent repeated review requests |
| `TRIAL_REMINDER_HOURS` | `24` | Trial reminder timing |
| `RETENTION_LOW_DAYS` | `7` | Low risk threshold |
| `RETENTION_MEDIUM_DAYS` | `14` | Medium risk threshold |
| `RETENTION_HIGH_DAYS` | `21` | High risk threshold |
| `DEFAULT_ASSIGNEE` | owner/staff name | Default task owner |
| `OWNER_EMAIL` | owner email | Internal notifications |

### Sheet Rules

- Keep column names exactly as documented.
- Use stable IDs like `lead_001`, `mem_001`, or generated UUIDs.
- Never delete log rows during testing. Filter them instead.
- Use `consent_status = yes/no/unknown`, not free-form text.
- Use `opted_out = TRUE/FALSE`.
- For demo data, import:
  - `data/sample-leads.csv`
  - `data/sample-members.csv`

## 5. n8n Setup

Create these workflows:

1. `01 - Lead Intake and Qualification`
2. `02 - Booking and Trial Follow-Up`
3. `03 - Member Lifecycle and Retention`
4. `04 - Campaign Approval and Sending`
5. `99 - Error Handler`

### Credentials

Create credentials for:

- Google Sheets
- Google Calendar
- Gmail
- OpenRouter via environment variables or Header Auth credential

### Required n8n Pattern

Every workflow should have:

- Trigger node
- Payload normalization step
- Validation step
- Consent/opt-out check before outbound messages
- Google Sheets update
- `Interactions` row when a message is sent, queued, failed, or skipped
- `Automation Logs` row at the end
- Error workflow set to `99 - Error Handler`

### Recommended Node Types

| Need | Node |
| --- | --- |
| Receive webhooks | `Webhook` |
| Return API response | `Respond to Webhook` |
| Transform/validate data | `Code` |
| Simple condition | `IF` |
| Multi-route condition | `Switch` |
| Call OpenRouter | `HTTP Request` |
| CRM read/write | `Google Sheets` |
| Email sending | `Gmail` |
| Booking | `Google Calendar` |
| Scheduled checks | `Schedule Trigger` |
| Error capture | `Error Trigger` |

### Local n8n Run Command

For local HTTP testing, start n8n like this in PowerShell:

```powershell
$env:N8N_SECURE_COOKIE='false'
n8n
```

n8n defaults to secure cookies. That is correct behind HTTPS, but it can cause local HTTP sessions at `http://localhost:5678` to behave strangely. Keep this setting local-only; do not use it for a public HTTPS deployment unless you understand the security tradeoff.

## 6. Cloudflare Worker Setup

The Worker setup has its own beginner-friendly walkthrough:

```text
docs/cloudflare-worker-setup.md
```

Use that guide when you are ready to deploy the webhook router. It explains Cloudflare, Wrangler, secrets, local testing, deployment, Postman testing, and common failure cases step by step.

At a high level, this project uses:

```text
src/cloudflare-worker/worker.js
src/cloudflare-worker/wrangler.toml.example
```

The Worker should be deployed as:

```text
gym-sales-automation-os-router
```

Required Worker secrets:

```powershell
npx wrangler secret put WEBHOOK_SHARED_SECRET
npx wrangler secret put N8N_LEAD_WEBHOOK_URL
npx wrangler secret put N8N_RESAMANIA_WEBHOOK_URL
npx wrangler secret put N8N_INTERACTION_WEBHOOK_URL
```

Optional secret:

```powershell
npx wrangler secret put N8N_OUTBOUND_TOKEN
```

Use `N8N_OUTBOUND_TOKEN` only if you add token authentication to the n8n webhooks.

### Worker Routes Summary

| Route | Purpose |
| --- | --- |
| `/lead` | New lead events |
| `/resamania` | Mock Resamania events |
| `/interaction` | Manual/inbound interaction events |

The Worker is responsible for:

- Accepting only `POST` requests
- Validating the shared secret header
- Validating the JSON body
- Normalizing the payload shape
- Adding `event_id`
- Adding `received_at`
- Routing the event to the correct n8n production webhook
- Returning a useful response for testing

## 7. OpenRouter Setup

In OpenRouter:

1. Create an API key.
2. Add credits if needed.
3. Choose a model that supports structured JSON outputs.
4. Store the model name as `OPENROUTER_MODEL`.

Use:

```text
docs/openrouter-n8n-http.md
```

### HTTP Request Node

Node:

```text
HTTP Request
```

Settings:

| Setting | Value |
| --- | --- |
| Method | `POST` |
| URL | `https://openrouter.ai/api/v1/chat/completions` |
| Send Headers | `On` |
| Send Body | `On` |
| Body Content Type | `JSON` |
| Response Format | `JSON` |

Headers:

```text
Authorization: Bearer {{$env.OPENROUTER_API_KEY}}
Content-Type: application/json
HTTP-Referer: {{$env.APP_URL}}
X-OpenRouter-Title: Gym Sales Automation OS
```

If parsing fails:

- Do not send a message.
- Add `Automation Logs.status = failed`.
- Create a `Tasks` row with `priority = high`.
- Keep the raw error for debugging.

## 8. Workflow 01: Lead Intake and Qualification

This is the most important workflow. Build and test it first.

### Trigger

Node:

```text
Webhook
```

Path:

```text
lead-intake
```

### Required Steps

1. Receive lead payload.
2. Normalize and validate required fields:
   - `name`
   - `email` or `phone`
   - `source`
   - `consent_status`
3. Search `Leads` by email.
4. If no email match, search by phone.
5. Route duplicate vs new lead vs conflict.
6. Call OpenRouter.
7. Parse JSON response in a `Code` node.
8. Append or update the `Leads` row.
9. Check consent and opt-out.
10. Send email if allowed.
11. Queue manual follow-up if consent is missing or channel is WhatsApp/SMS.
12. Append an `Interactions` row.
13. Append an `Automation Logs` row.
14. Respond to the webhook.

### Lead Dedupe Rule

Use this order:

1. Match by email if email exists.
2. Match by phone if phone exists.
3. If both match different rows, create a manual review task.
4. If no match, create a new lead.

### Consent Rule

| consent_status | opted_out | Action |
| --- | --- | --- |
| `yes` | `FALSE` | Message can be sent if channel is available |
| `yes` | `TRUE` | Skip message and log skipped |
| `unknown` | any | Queue manual review |
| `no` | any | Do not send marketing message |

### First Reply Rule

Send first reply only if:

- `automation_allowed = true`
- `consent_status = yes`
- `opted_out = FALSE`
- email exists
- message does not include prohibited claims

### Test Payload

Send this to the Worker `/lead` route:

```json
{
  "event_type": "lead.created",
  "source": "website",
  "name": "Claire Martin",
  "email": "claire@example.com",
  "phone": "+33601020304",
  "message": "Bonjour, je voudrais faire une séance d'essai cette semaine pour perdre du poids.",
  "fitness_goal": "weight_loss",
  "interested_service": "personal_training",
  "preferred_channel": "email",
  "consent_status": "yes",
  "opted_out": false
}
```

### Acceptance Test

Pass criteria:

- Lead is created or updated in `Leads`.
- Lead has temperature, score, AI summary, and next action.
- French reply is generated.
- Email is sent or queued correctly.
- `Interactions` has a row for the outbound message.
- `Automation Logs` has a success row.
- Duplicate test does not create a second lead.

## 9. Workflow 02: Booking and Trial Follow-Up

Build after Workflow 01 works.

### Trigger Options

- `Webhook` for staff forms and slot selection
- `Schedule Trigger` for reminder checks

### Required Steps

1. Get lead row.
2. Check consent and opt-out.
3. Get available trial slots from Google Calendar or static Settings.
4. Send booking options.
5. When slot is selected, create Google Calendar event.
6. Send confirmation email.
7. Send reminder 24 hours before trial.
8. Update lead stage to `trial_booked`.
9. Log every action.

### Booking Rules

- Do not create duplicate calendar events for the same lead and same slot.
- Include address and preparation instructions in the confirmation email.
- Use `templates/email/trial-confirmation.md`.
- If consent is missing, create a manual task instead of sending.

## 10. Workflow 03: Member Lifecycle and Retention

### Trigger Options

- `Webhook` for mock Resamania events
- `Schedule Trigger` for daily retention

Use mock payloads:

- `data/mock-resamania/member-created.json`
- `data/mock-resamania/attendance-updated.json`

### New Member Required Steps

1. Search existing member by email/phone/member ID.
2. Create or update `Members` row.
3. Update related lead stage to `member`.
4. Send welcome email.
5. Send or schedule first-week guidance.
6. Create review request task for later.
7. Add member interests for segmentation.
8. Log all actions.

### Retention Required Steps

1. Schedule daily run.
2. Read active members.
3. Calculate days since `last_visit_date`.
4. Calculate days until `membership_end_date`.
5. Assign risk level.
6. Update `Members.retention_risk`.
7. Send or queue outreach based on consent.
8. Create owner task for high-risk members.
9. Log success/skipped/failed actions.

### Risk Logic

| Condition | Risk |
| --- | --- |
| No visit for 7-13 days | low |
| No visit for 14-20 days | medium |
| No visit for 21+ days | high |
| Membership ends within 10 days | renewal |
| Complaint/negative sentiment | service |

## 11. Workflow 04: Campaign Approval and Sending

### Reactivation

Use mock payload:

```text
data/mock-resamania/member-cancelled.json
```

Required steps:

1. Segment former member.
2. Check consent.
3. Generate reactivation draft with OpenRouter.
4. Add campaign row with `status = approval_needed`.
5. Create owner approval task.
6. Send only after approval.
7. Track response.
8. Move interested former member back to lead pipeline.

### Upsell

Required steps:

1. Search active members weekly.
2. Calculate behavior signals.
3. Call OpenRouter using `prompts/upsell-recommendation.md`.
4. Validate response with `schemas/upsell-recommendation.schema.json`.
5. Add campaign row with `approval_needed`.
6. Create owner approval task.
7. Send only after owner approval.

### Upsell Rules

- No automatic upsell sending.
- No fake urgency.
- No invented discounts.
- Owner must approve or reject.

## 12. Dashboard Build

Build the dashboard inside Google Sheets first.

Use:

```text
docs/dashboard-spec.md
```

Dashboard sections:

1. Sales Pipeline
2. Today's Tasks
3. Retention View
4. Campaign Approvals
5. Automation Logs

## 13. Error Handling Standard

Create:

```text
99 - Error Handler
```

Trigger:

```text
Error Trigger
```

Every failed action should produce:

1. `Automation Logs` row with `status = failed`.
2. `error_message` containing useful details.
3. `Tasks` row if human action is needed.

Common failures:

| Failure | Response |
| --- | --- |
| OpenRouter fails | Create manual review task, do not send AI message |
| JSON parse fails | Log failed, create task |
| Google Sheets update fails | Let error workflow log failure |
| Email send fails | Log failed, create follow-up task |
| Duplicate conflict | Create manual merge task |
| Consent missing | Log skipped, create manual review task |

## 14. Testing Plan

### Test 1: Worker Validation

Send a valid lead payload.

Expected:

- Worker returns `202`.
- n8n workflow receives payload.

Send invalid payload without name.

Expected:

- Worker returns `422`.
- n8n is not called.

### Test 2: Lead Intake Happy Path

Use Claire sample lead.

Expected:

- Lead saved.
- AI fields saved.
- Email sent.
- Interaction logged.
- Automation logged.

### Test 3: Duplicate Lead

Send the same email again.

Expected:

- Existing row updates.
- No duplicate row is created.
- Log says duplicate/update.

### Test 4: Consent Missing

Send lead with:

```json
"consent_status": "unknown"
```

Expected:

- Lead saved.
- No marketing email sent.
- Manual review task created.
- Skipped action logged.

### Test 5: Opt-Out

Send lead with:

```json
"opted_out": true
```

Expected:

- Lead saved.
- No message sent.
- Skipped interaction/log row created.

### Test 6: Mock Resamania Member Created

Send:

```text
data/mock-resamania/member-created.json
```

Expected:

- Member row created.
- Lead stage updated to member.
- Onboarding email sent or queued.
- Review task scheduled.

### Test 7: Retention Risk

Set one member's `last_visit_date` to more than 21 days ago.

Expected:

- Risk becomes `high`.
- Owner task created.
- Message sent only if allowed.

### Test 8: Review Cooldown

Set `review_requested_at` to a recent date.

Expected:

- No new review request sent.
- Skipped log created.

## 15. Portfolio Documentation

Collect screenshots as you build.

Required screenshots:

1. n8n workflow overview
2. Lead intake workflow nodes
3. OpenRouter HTTP Request node configuration, without API key
4. Google Sheets dashboard
5. Lead row after AI qualification
6. Automation logs
7. Campaign approval queue
8. Retention risk view
9. Email template preview
10. Worker test response

### Case Study Structure

1. Problem
2. Goal
3. Stack
4. Architecture
5. Main workflows
6. AI design
7. Compliance/consent handling
8. Demo results
9. Cost notes
10. What would change for production

### Demo Video Flow

Record a 5-8 minute walkthrough:

1. Show business problem.
2. Show architecture diagram.
3. Submit test lead.
4. Show n8n workflow execution.
5. Show OpenRouter output.
6. Show Google Sheets lead row.
7. Show email/log/task.
8. Show retention/dashboard views.
9. Explain Resamania mock adapter.
10. Close with production upgrade path.

## 16. Production Upgrade Path

After the MVP works, upgrade in this order:

1. Replace Google Sheets with Supabase.
2. Add real Resamania webhooks/API when access is available.
3. Add real website form.
4. Add authenticated owner dashboard.
5. Add WhatsApp Business API only after consent rules are finalized.
6. Add stronger audit log retention.
7. Add role-based access control.
8. Add monitoring and alerting.

## 17. What Not To Do

Avoid these mistakes:

- Do not build every workflow before Workflow 01 works.
- Do not let AI decide consent.
- Do not let AI invent prices, discounts, or availability.
- Do not send upsell campaigns automatically.
- Do not hide failed automations.
- Do not delete test logs that prove the system works.
- Do not connect live WhatsApp/SMS before compliance is clear.
- Do not treat mock Resamania as real production integration.

## 18. Final Delivery Checklist

- [ ] Lead intake works end to end
- [ ] OpenRouter returns valid structured JSON
- [ ] Duplicate leads are handled
- [ ] Consent and opt-out are enforced
- [ ] Emails or manual queues work correctly
- [ ] Interactions are logged
- [ ] Automation logs show success, failure, skipped, and queued examples
- [ ] Booking flow works with Google Calendar
- [ ] Member onboarding works from mock Resamania payload
- [ ] Retention risk workflow flags inactive members
- [ ] Review request cooldown works
- [ ] Upsell recommendations require approval
- [ ] Dashboard shows the main operating views
- [ ] README and docs explain setup clearly
- [ ] Screenshots are collected
- [ ] Demo walkthrough is recorded or scripted
