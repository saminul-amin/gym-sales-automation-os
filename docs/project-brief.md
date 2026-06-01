# Gym Sales Automation OS

**Professional MVP build spec for an n8n + OpenRouter automation system**

## 1. Project Overview

**Project name:** Gym Sales Automation OS  
**Demo business:** Elite Club, Maisons-Alfort, France  
**Project type:** Internal engineering capability test and PlugWheel portfolio project  
**Primary goal:** Build a working AI-assisted sales, retention, review, and upsell automation system for a gym using n8n, OpenRouter, and mostly free or low-cost services.

The system simulates how a modern gym can automate the full customer lifecycle:

1. Lead capture
2. AI lead qualification
3. Trial/session booking follow-up
4. Sales nurturing
5. New member onboarding
6. Retention risk detection
7. Former member reactivation
8. Review request automation
9. Upsell campaigns for coaching, Pilates Reformer, supplements, and premium memberships
10. Owner dashboard and documentation

Resamania is treated as an external gym management system. Because real Resamania API/webhook access requires coordination with their support/API team, the MVP includes a mock Resamania adapter and leaves a clean path for real integration later.

## 2. Professional Build Positioning

This project should feel like a production-minded automation system, not a collection of disconnected automations.

> A gym owner gets one operating system for lead follow-up, trial conversion, onboarding, retention, reviews, and upsells. n8n handles orchestration, OpenRouter handles AI classification and copy generation, and every automated action is logged, consent-aware, and reviewable.

The build should demonstrate:

- System architecture design
- n8n workflow design
- Webhook handling
- OpenRouter API integration
- Structured AI outputs
- CRM/data modeling
- Consent-first automation
- Retry and error handling
- Audit logging
- Dashboard/reporting
- Demo-ready documentation

## 3. Business Problem

Gyms lose revenue because leads are not followed up quickly, trial visitors are not nurtured, inactive members are not detected early, reviews are not systematically requested, and upsell opportunities are handled manually.

The gym owner needs to:

- Capture leads from forms, social channels, imports, and manual entry
- Automatically qualify leads using AI
- Send or queue personalized follow-up messages
- Track every lead/member status
- Trigger retention and reactivation campaigns
- Request Google reviews after positive interactions
- Identify upsell opportunities
- View pipeline, tasks, and automation logs from one place

## 4. Stack Decision

| Layer | Tool | Reason |
| --- | --- | --- |
| Workflow automation | n8n | Strong workflow control, self-hosting option, visual logic, good HTTP/webhook support |
| Webhook/API gateway | Cloudflare Worker | Lightweight validation, normalization, routing, and secret protection before n8n |
| CRM database | Google Sheets for MVP, Supabase optional | Sheets is easiest for demo; Supabase is stronger for production |
| Email sending | Gmail or Brevo | Gmail is easiest for MVP; Brevo is better for transactional-style sends |
| AI gateway | OpenRouter | One OpenAI-compatible API surface with model flexibility |
| Booking | Google Calendar or Cal.com | Free/low-cost booking confirmation and reminders |
| Owner dashboard | Google Sheets dashboard first, lightweight web dashboard optional | Fastest path to a demoable operator view |
| Instagram/Facebook intake | Simulated first, Meta API later | Keeps MVP buildable without platform approvals |
| WhatsApp/SMS | Mock or manual queue first | Avoids compliance and cost complexity in MVP |
| Gym management system | Mock Resamania adapter | Real integration can be added when credentials/webhooks are available |

## 5. MVP Principles

- **Consent before outreach:** no marketing message is sent unless consent is present and opt-out is false.
- **Deterministic rules before AI:** validation, dedupe, risk thresholds, cooldowns, and stage changes should be rule-based.
- **Structured AI only:** OpenRouter calls must request JSON output and n8n must validate/parse the result.
- **Human approval for promotions:** upsell, reactivation, and sensitive retention messages should be queued for owner approval.
- **Every action is logged:** successful, failed, skipped, and queued actions all create automation log entries.
- **Mock external dependencies cleanly:** Resamania, WhatsApp, SMS, and social messages can be simulated without blocking the MVP.

## 6. In Scope for MVP

### Lead Capture

Capture leads from:

- Website form
- Manual entry form
- CSV import
- Simulated Instagram/Facebook message
- Simulated WhatsApp message

Each lead stores:

- Name
- Phone
- Email
- Source
- Fitness goal
- Preferred service
- Original message
- Consent status
- Lead score
- AI summary
- Lifecycle stage
- Next action
- Assigned owner
- Created date
- Last contact date
- Opt-out status

### AI Lead Qualification

OpenRouter should analyze each lead and return structured JSON:

- Intent
- Urgency
- Service interest
- Fitness goal
- Budget sensitivity
- Preferred contact channel
- Lead temperature: hot, warm, cold
- Lead score
- Recommended next action
- Suggested French reply
- Risk flags

Example lead temperatures:

- **Hot:** asks about price, trial, membership, visit time, or booking
- **Warm:** asks general questions about programs/classes
- **Cold:** vague inquiry, low intent, no clear goal

### Follow-Up Automation

| Trigger | Action |
| --- | --- |
| New hot lead | Send or queue reply within 2 minutes |
| Lead does not respond in 24h | Send reminder |
| Trial booked | Send confirmation email |
| Trial date tomorrow | Send reminder |
| Trial attended but not converted | Send offer/consultation follow-up |
| Lead inactive for 7 days | Move to nurture sequence |
| Lead says "stop" | Mark opted out and suppress future marketing |

### Booking Flow

The MVP supports:

- Booking request capture
- Available time slot selection
- Google Calendar event creation
- Confirmation email
- Reminder email
- Internal notification to owner

### Member Onboarding

When a lead becomes a member, either manually or through mock Resamania event:

- Update lifecycle stage to `Member`
- Create/update member record
- Send welcome email
- Send first-week guidance
- Schedule review request after configurable delay
- Tag member interests for upsell campaigns

### Retention Risk Detection

Use mock attendance data for the MVP.

| Condition | Risk Level |
| --- | --- |
| No visit for 7 days | Low risk |
| No visit for 14 days | Medium risk |
| No visit for 21+ days | High risk |
| Membership ending within 10 days | Renewal risk |
| Complaint or negative sentiment | Service risk |

Actions:

- Generate internal task
- Send friendly re-engagement message if consent allows
- Notify owner for high-risk members
- Log all actions, including skipped messages

### Former Member Reactivation

For cancelled or expired members:

- Import former member list
- Segment by cancellation reason, last visit, previous plan, and interest
- Generate AI-personalized reactivation message
- Send email sequence or queue WhatsApp/SMS for manual sending
- Move interested former members back to the lead pipeline

### Google Review Request Flow

Trigger a review request when:

- Member joined successfully
- Member completed first month
- Member gave positive feedback
- Staff manually marks satisfaction as positive

Flow:

1. Check cooldown period.
2. Generate short review request message.
3. Send configured review link.
4. Log request date.
5. Optionally fetch new reviews using Google Business Profile API later.

### Upsell Automation

| Signal | Suggested Upsell |
| --- | --- |
| Interested in weight loss | Personal coaching |
| Female lead asking for low-impact training | Pilates Reformer |
| Member attends frequently | Premium plan |
| Member asks about nutrition | Supplements |
| Member has plateau or low motivation | Coaching consultation |

AI can suggest the angle and draft copy, but promotional messages require owner approval before sending.

## 7. Out of Scope for MVP

- Full paid GoHighLevel implementation
- Live SMS sending
- Live WhatsApp marketing blast
- Payment collection
- Full Resamania production integration without access
- Advanced ad campaign management
- Complex multi-location gym support
- Full GDPR legal compliance system
- AI making final business decisions without human review

## 8. Compliance and Safety Requirements

Because the demo business is in France, the MVP should use EU-style consent and opt-out assumptions.

Minimum requirements:

- Store consent status for each lead/member
- Do not send marketing messages if consent is missing
- Include opt-out handling
- Log contact source
- Keep message history
- Avoid sensitive health claims
- Avoid AI-generated medical advice
- Avoid guaranteed fitness results
- Allow human review for promotional campaigns

## 9. User Roles

### Gym Owner/Admin

Can:

- View dashboard
- See leads and members
- Approve AI-generated campaigns
- Edit message templates
- See automation logs
- Manually update lead/member stages
- Export reports

### Sales Staff

Can:

- View assigned leads
- Update lead status
- Add notes
- Trigger manual follow-up
- Mark trial attended
- Mark member converted

### Automation System

Can:

- Capture data
- Enrich leads using AI
- Send approved messages
- Create tasks
- Update statuses
- Detect inactivity
- Log every action

## 10. Data Model

Use the full schema in `docs/google-sheets-schema.md`.

Core tabs:

- `Leads`
- `Members`
- `Interactions`
- `Automation Logs`
- `Campaigns`
- `Tasks`
- `Settings`
- `Dashboard`

## 11. System Architecture

```text
Lead Sources
  - Website form
  - Manual entry form
  - CSV import
  - Instagram/Facebook simulation
  - WhatsApp simulation
  - Mock Resamania events

        |
        v

Cloudflare Worker Webhook Router
  - Validates method, secret, and payload shape
  - Normalizes event data
  - Adds event ID and timestamp
  - Routes to the correct n8n production webhook

        |
        v

n8n Workflow Layer
  - Lead intake and qualification
  - Booking follow-up
  - Trial conversion follow-up
  - Member onboarding
  - Retention checks
  - Reactivation campaigns
  - Review request flow
  - Upsell recommendations

        |
        v

Data and Communication Layer
  - Google Sheets CRM
  - Gmail/Brevo email
  - Google Calendar
  - OpenRouter AI calls
  - Mock WhatsApp/SMS queues
  - Automation logs

        |
        v

Owner Dashboard
  - Pipeline
  - Today's tasks
  - Retention risks
  - Campaign approvals
  - Automation logs
```

## 12. n8n Workflow Catalogue

For the detailed workflow build, use:

- `n8n/workflow-blueprints.md`
- `n8n/node-setup-guide.md`

Recommended MVP workflows:

1. `01 - Lead Intake and Qualification`
2. `02 - Booking and Trial Follow-Up`
3. `03 - Member Lifecycle and Retention`
4. `04 - Campaign Approval and Sending`
5. `99 - Error Handler`

The original lifecycle can still be shown as eight business workflows, but the n8n build can be simpler because one workflow can contain richer branching logic.

## 13. OpenRouter Contract

OpenRouter should be called through n8n's `HTTP Request` node.

**Endpoint:** `POST https://openrouter.ai/api/v1/chat/completions`

**Required headers:**

- `Authorization: Bearer {{$env.OPENROUTER_API_KEY}}`
- `Content-Type: application/json`

**Recommended attribution headers:**

- `HTTP-Referer: {{$env.APP_URL}}`
- `X-OpenRouter-Title: Gym Sales Automation OS`

**Model rule:**

- Store model selection as `OPENROUTER_MODEL`.
- Use a model that supports structured outputs.
- Keep a fallback model as `OPENROUTER_FALLBACK_MODEL`.

**Response format rule:**

- Use `response_format.type = json_schema` when supported.
- Set `strict = true`.
- Parse and validate the model content before writing to Sheets.
- If strict schema fails, log the error and create a manual review task.

## 14. AI Guardrails

AI may:

- Qualify leads
- Personalize messages
- Summarize conversations
- Recommend next actions
- Suggest upsell angles
- Detect sentiment
- Generate owner-facing summaries

AI must not:

- Give medical advice
- Create false guarantees
- Invent pricing
- Claim discounts unless configured in Settings
- Override consent rules
- Send promotional campaigns without approval

## 15. Dashboard Requirements

The MVP dashboard can be a Google Sheet dashboard first, with an optional lightweight web dashboard later.

Required views:

- **Sales Pipeline:** new leads, hot leads, trial requested, trial booked, trial attended, converted, lost
- **Today's Tasks:** leads needing follow-up, trials today/tomorrow, high-risk members, approval-needed messages
- **Retention View:** active members, low/medium/high risk, inactive 14+ days, inactive 21+ days
- **Campaign View:** active campaigns, queued messages, sent messages, failed messages, opt-outs
- **Automation Logs:** workflow name, entity, action, status, error message, timestamp

## 16. Cost and Limit Controls

Document and control:

- n8n hosting method and execution limits
- Google Sheets API read/write patterns
- Email send limits
- OpenRouter model cost per 1,000 leads/members
- WhatsApp/SMS production cost warning
- Resamania integration limitation
- Google API quota considerations

Design choices:

- Batch reads/writes where possible
- Avoid unnecessary polling
- Use scheduled workflows for bulk checks
- Store token usage from OpenRouter responses when available
- Keep high-volume messaging out of the MVP unless consent and cost controls are ready

## 17. Required Deliverables

### Technical Deliverables

1. Architecture diagram/spec
2. Google Sheets schema
3. n8n workflow blueprints or exports
4. Cloudflare Worker webhook router code
5. OpenRouter prompt files
6. OpenRouter JSON schemas
7. Sample lead/member dataset
8. Mock Resamania webhook payloads
9. Email templates
10. Review request template
11. Reactivation campaign template
12. Dashboard/dashboard sheet specification
13. Error logging workflow
14. README setup guide
15. Demo video or Loom walkthrough script
16. Owner training guide

### Portfolio Deliverables

1. Case-study style project summary
2. Before/after workflow diagram
3. Screenshots of dashboard
4. Screenshots of automation logs
5. Example AI qualification output
6. Example email/review/reactivation flows
7. Cost-saving explanation: built without GoHighLevel or Zapier, using n8n and OpenRouter for transparent automation logic

## 18. Build Phases

### Phase 1: Foundations

- Create Google Sheets CRM
- Add Settings, Logs, Leads, Members, Interactions, Campaigns, Tasks
- Deploy Cloudflare Worker router
- Create n8n webhook workflows
- Add OpenRouter credentials and model settings
- Create the `99 - Error Handler` workflow

### Phase 2: Sales MVP

- Build lead intake workflow
- Add OpenRouter qualification
- Add first response logic
- Add duplicate handling
- Add lead pipeline dashboard

### Phase 3: Booking and Conversion

- Add booking request flow
- Add Google Calendar event creation
- Add reminders
- Add trial attended/no-show follow-ups

### Phase 4: Member Lifecycle

- Add mock Resamania events
- Add onboarding
- Add review request cooldown
- Add retention risk detection

### Phase 5: Campaigns and Portfolio Polish

- Add reactivation campaign
- Add upsell approval queue
- Add screenshots and demo data
- Record walkthrough
- Finalize case study

## 19. Professional Acceptance Checklist

- [ ] Every workflow has a configured error workflow
- [ ] Every outbound message checks consent and opt-out
- [ ] AI responses are parsed and validated before storage
- [ ] Duplicate leads are merged or updated
- [ ] All skipped actions are logged
- [ ] Settings are configurable without editing workflow logic
- [ ] Review requests have cooldown protection
- [ ] Upsell campaigns require approval
- [ ] Mock Resamania payloads are documented
- [ ] README can be followed by another builder
- [ ] Demo data shows happy path and failure path
- [ ] Portfolio summary explains business value clearly

