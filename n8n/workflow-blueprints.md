# n8n Workflow Blueprints

These blueprints describe the production-minded n8n workflows for the Gym Sales Automation OS.

For exact node settings, expressions, mappings, and route details, use `n8n/node-setup-guide.md`.

## Shared n8n Conventions

- Use stable workflow names.
- Add clear node names and node notes.
- Normalize webhook payloads in a `Code` node near the start.
- Use `IF` nodes for two-way checks and `Switch` nodes for multi-route lifecycle logic.
- Use `Google Sheets` rows as the MVP database.
- Use `HTTP Request` for OpenRouter calls.
- Use `Gmail` first for MVP email sending; Brevo can be added later.
- Use `Google Calendar` for trial booking.
- Keep each business area as one workflow canvas with route groups. Avoid `Execute Sub-workflow` or cross-workflow node references unless you are intentionally building a reusable utility workflow.
- Configure `99 - Error Handler` as the error workflow for all production workflows.

## Recommended MVP Workflow Set

n8n can keep the build compact because one workflow can contain richer branching logic. Use four main workflows plus one error workflow:

1. `01 - Lead Intake and Qualification`
2. `02 - Booking and Trial Follow-Up`
3. `03 - Member Lifecycle and Retention`
4. `04 - Campaign Approval and Sending`
5. `99 - Error Handler`

Workflows 02, 03, and 04 should stay undivided. Their internal route labels are for canvas organization only, not separate n8n workflow names.

## Workflow 01 - Lead Intake and Qualification

**Trigger:** `Webhook`

**Purpose:** Receive a lead, validate it, dedupe it, qualify it with OpenRouter, save/update the lead, send or queue the first follow-up, and log everything.

**Core nodes:**

1. `Webhook` - receives `/lead-intake`
2. `Code` - normalizes payload and validates required fields
3. `IF` - valid vs invalid payload
4. `Google Sheets` - search Leads by email
5. `Google Sheets` - search Leads by phone
6. `Code` - decide dedupe result
7. `Code` - build OpenRouter prompt
8. `HTTP Request` - call OpenRouter
9. `Code` - parse AI JSON content
10. `Switch` - new lead, existing lead, duplicate conflict
11. `Google Sheets` - append or update Lead row
12. `Switch` - send email, queue manual task, skip, or manual review
13. `Gmail` - send first reply when allowed
14. `Google Sheets` - append Interaction row
15. `Google Sheets` - append Automation Log row
16. `Respond to Webhook` - return processing result

**Acceptance criteria:**

- Duplicate leads are not created.
- AI output is valid JSON.
- Lead score is saved.
- First response is generated in French.
- Failed AI/API calls are logged.
- Consent and opt-out are enforced.
- Owner can see the lead in the Sheet/dashboard.

## Workflow 02 - Booking and Trial Follow-Up

**Triggers:** `Webhook`, `Schedule Trigger`, or manual staff update

**Purpose:** Handle trial requests, slot selection, Google Calendar event creation, confirmation email, reminder email, and trial outcome follow-up.

**Core routes:**

### Route A: Trial Requested

1. `Webhook` or `Google Sheets Trigger` equivalent/manual update process
2. `Google Sheets` - get Lead row
3. `IF` - consent and email available
4. `Code` - prepare available slot options
5. `Gmail` - send booking options
6. `Google Sheets` - update stage to `trial_options_sent`
7. `Google Sheets` - log interaction and automation result

### Route B: Slot Selected

1. `Webhook` - receives selected slot
2. `Google Sheets` - get Lead row
3. `Google Calendar` - create trial event
4. `Gmail` - send confirmation email
5. `Google Sheets` - update stage to `trial_booked`
6. `Google Sheets` - log interaction and automation result

### Route C: Tomorrow's Trial Reminder

1. `Schedule Trigger` - daily
2. `Google Sheets` - get trial-booked leads
3. `Code` - filter trials happening tomorrow
4. `IF` - can send reminder?
5. True branch: `Gmail` sends reminder
6. True branch: `Google Sheets` updates `trial_reminder_sent_at`
7. True branch: `Google Sheets` logs sent interaction and success automation
8. False branch: `Google Sheets` logs skipped interaction and skipped automation
9. False branch: create a manual task only when the reason needs human review, such as unknown consent or missing email

### Route D: Trial Outcome

1. `Webhook` - staff submits attended/no-show/converted/not interested
2. `Switch` - route by outcome
3. `Gmail` - send follow-up/rebooking message if allowed
4. `Google Sheets` - update stage
5. `Google Sheets` - create task after second no-response

**Acceptance criteria:**

- Calendar event is created.
- Confirmation email is sent.
- Reminder logic works.
- No-show and attended follow-ups differ.
- Lead stage updates correctly.

## Workflow 03 - Member Lifecycle and Retention

**Triggers:** `Webhook` for mock Resamania events and `Schedule Trigger` for daily retention checks.

**Purpose:** Convert leads to members, onboard new members, schedule review tasks, update attendance, and flag retention risks.

**Core routes:**

### Route A: Member Created

1. `Webhook` - receives mock `member.created`
2. `Code` - normalize Resamania payload
3. `Google Sheets` - search Members
4. `IF` - existing vs new member
5. `Google Sheets` - append/update Member row
6. `Google Sheets` - update related Lead stage to `member`
7. `Gmail` - send welcome email if allowed
8. `Google Sheets` - create review task for later
9. `Google Sheets` - log interaction and automation result

### Route B: Attendance Updated

1. `Webhook` - receives mock `attendance.updated`
2. `Google Sheets` - search Member
3. `Google Sheets` - update `last_visit_date` and `visit_count_30_days`
4. `Google Sheets` - log automation result

### Route C: Daily Retention Risk

1. `Schedule Trigger` - daily at 08:00
2. `Google Sheets` - get active Members
3. `Code` - calculate inactivity and renewal risk
4. `Switch` - none, low, medium, high, renewal
5. `Google Sheets` - update retention risk
6. `Gmail` - send medium-risk re-engagement if allowed
7. `Google Sheets` - create high-risk owner task
8. `Google Sheets` - log sent/skipped/queued actions

### Route D: Review Request

1. `Schedule Trigger` or manual webhook
2. `Google Sheets` - get due review tasks/members
3. `Code` - check cooldown and satisfaction state
4. `IF` - eligible vs not eligible
5. `Gmail` - send review request
6. `Google Sheets` - update review fields
7. `Google Sheets` - log interaction and automation result

**Acceptance criteria:**

- Member record is created.
- Lead lifecycle stage becomes `member`.
- Welcome email is sent or skipped according to consent policy.
- Review request is scheduled, not sent immediately.
- Members inactive for 14+ days are flagged.
- Members inactive for 21+ days create owner tasks.

## Workflow 04 - Campaign Approval and Sending

**Triggers:** `Schedule Trigger`, `Webhook`, or manual row update.

**Purpose:** Generate former member reactivation and upsell campaign drafts, queue them for owner approval, and send approved messages only after consent and approval checks.

**Core routes:**

### Route A: Former Member Reactivation

1. `Webhook` or `Schedule Trigger`
2. `Google Sheets` - get cancelled/expired Members
3. `IF` - consent yes and not opted out
4. `Code` - calculate segment
5. `HTTP Request` - OpenRouter generates reactivation draft
6. `Code` - parse structured output
7. `Google Sheets` - append Campaign row with `approval_needed`
8. `Google Sheets` - append approval Task
9. `Google Sheets` - log automation result

### Route B: Weekly Upsell Recommendation

1. `Schedule Trigger` - weekly
2. `Google Sheets` - get active Members
3. `Code` - calculate upsell signals
4. `IF` - eligible vs skip
5. `HTTP Request` - OpenRouter generates upsell recommendation
6. `Code` - parse structured output
7. `Google Sheets` - append Campaign row with `approval_needed`
8. `Google Sheets` - append approval Task
9. `Google Sheets` - log automation result

### Route C: Approved Campaign Sender

1. `Schedule Trigger` - every hour or manual
2. `Google Sheets` - get Campaigns where `status = active`
3. `Google Sheets` - get recipient Lead/Member
4. `IF` - consent yes and not opted out
5. `Gmail` - send approved campaign message
6. `Google Sheets` - update Campaign to `complete`
7. `Google Sheets` - log interaction and automation result

**Acceptance criteria:**

- Reactivation messages are personalized.
- No campaign message is sent without consent.
- Upsell messages require approval.
- AI does not invent discounts.
- Owner can reject suggestions.

## Workflow 99 - Error Handler

**Trigger:** `Error Trigger`

**Purpose:** Capture failed workflow executions and write readable error logs.

**Core nodes:**

1. `Error Trigger`
2. `Code` - normalize error payload
3. `Google Sheets` - append Automation Log row
4. Optional `Gmail` - notify owner for critical failures

**Acceptance criteria:**

- Failed workflows write to `Automation Logs`.
- Error message, workflow name, node name, and execution URL are captured when available.
- Owner receives critical failure notification if enabled.
