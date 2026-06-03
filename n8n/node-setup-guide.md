# n8n Node Setup Guide

This is the beginner-friendly, node-by-node build guide for Gym Sales Automation OS.

It assumes you have just installed n8n and are new to the editor. Follow it slowly. Build **Workflow 01** first. Do not build the other workflows until Workflow 01 works end to end.

Use this guide with:

- `docs/google-sheets-schema.md`
- `docs/openrouter-n8n-http.md`
- `prompts/`
- `schemas/`
- `templates/`

## 0. Beginner Vocabulary

Before building, understand these n8n words:

| Word | Meaning |
| --- | --- |
| Workflow | One automation canvas, for example `01 - Lead Intake and Qualification` |
| Node | One step in a workflow, for example `Webhook`, `Code`, `Google Sheets` |
| Trigger node | A node that starts a workflow, for example `Webhook` or `Schedule Trigger` |
| Item | One JSON object moving through the workflow |
| JSON | Structured data like `{ "name": "Claire" }` |
| Expression | Dynamic value in n8n, usually starts with `{{ ... }}` |
| Branch | A path coming out of an `IF` or `Switch` node |
| Route | Same idea as branch; one possible path through the workflow |
| Credential | Saved login/API access for Google, Gmail, OpenRouter, etc. |
| Test URL | Webhook URL that works while you are manually testing |
| Production URL | Webhook URL that works after the workflow is active |

## 1. Very Important Build Rules

Follow these rules exactly:

1. **Do not rename nodes casually.** Some Code nodes below reference earlier nodes by name.
2. If you rename a node, update every code snippet that mentions that node name.
3. Build only `01 - Lead Intake and Qualification` first.
4. After every node, run a small test before adding more nodes.
5. Use the `Settings` tab inside search/read nodes and turn on `Always Output Data` where this guide says to.
6. Keep API keys out of screenshots and public docs.
7. If something fails, read the last failed node first. n8n usually tells you exactly which node broke.

### Respond to Webhook JSON Body Rule

For every `Respond to Webhook` node in this guide:

1. Set `Respond With` to `JSON`.
2. Click the `fx` / `Expression` option for `Response Body`.
3. Paste the expression shown in the guide.

Do not paste a whole-object expression such as `{{$node["Some Node"].json.response}}` into the fixed JSON editor. The fixed editor tries to validate that text as raw JSON and may show:

```text
Invalid JSON in 'Response Body' field
```

The guide uses `JSON.stringify(...)` for these response bodies so n8n receives a valid JSON response body after evaluating the expression.

## 2. n8n Workflows to Create

Create these workflows in n8n:

1. `01 - Lead Intake and Qualification`
2. `02 - Booking and Trial Follow-Up`
3. `03 - Member Lifecycle and Retention`
4. `04 - Campaign Approval and Sending`
5. `99 - Error Handler`

For now, build only:

```text
01 - Lead Intake and Qualification
```

## 3. Credentials to Create

In n8n, go to:

```text
Credentials > Add Credential
```

Create these:

| Credential Name | Credential Type | Used By |
| --- | --- | --- |
| `Gym CRM Google Sheets` | Google Sheets OAuth2 | Google Sheets nodes |
| `Elite Club Gmail` | Gmail OAuth2 | Gmail nodes |
| `Elite Club Google Calendar` | Google Calendar OAuth2 | Booking workflow |
| `OpenRouter Header Auth` | Header Auth, optional | HTTP Request node |

## 3A. How to Get Google Client ID and Client Secret

This section answers the exact Google Sheets credential screen you showed.

When n8n asks for:

```text
Client ID
Client Secret
```

you get those from **Google Cloud Console**. n8n is asking Google, "Can this local n8n app access this user's Google Sheets/Gmail/Calendar?" Google needs an OAuth app before it allows that.

### What the n8n Fields Mean

| n8n Field | What It Means | What You Do |
| --- | --- | --- |
| `OAuth Redirect URL` | The callback URL Google sends you back to after login | Copy this into Google Cloud exactly |
| `Client ID` | Public identifier for your Google OAuth app | Copy from Google Cloud after creating OAuth client |
| `Client Secret` | Private password for your Google OAuth app | Copy from Google Cloud after creating OAuth client |
| `Allowed HTTP Request Domains` | Extra n8n restriction for HTTP requests | Leave as `All` for now |
| `Sign in with Google` | Starts the OAuth login | Use after Client ID/Secret are filled |

Your screenshot shows this redirect URL:

```text
http://localhost:5678/rest/oauth2-credential/callback
```

Copy it exactly. Same `http`, same `localhost`, same port, same path.

### Step 1: Open Google Cloud Console

Go to:

```text
https://console.cloud.google.com/
```

Sign in with the Google account you want to connect to n8n.

### Step 2: Create a Google Cloud Project

1. Click the project selector in the top bar.
2. Click `New Project`.
3. Name it:

```text
Gym Sales Automation OS
```

4. Click `Create`.
5. Make sure this project is selected.

### Step 3: Enable the APIs

In Google Cloud Console, open:

```text
APIs & Services > Library
```

Enable these APIs:

```text
Google Sheets API
Google Drive API
Google Calendar API
Gmail API
```

For Google Sheets in n8n, enable **both** Google Sheets API and Google Drive API. Sheets files live in Google Drive, so Drive access is commonly needed too.

### Step 4: Configure OAuth Consent

Open:

```text
Google Auth Platform > Branding
```

or in older Google Cloud UI:

```text
APIs & Services > OAuth consent screen
```

Fill:

| Field | Value |
| --- | --- |
| App name | `Gym Sales Automation OS` |
| User support email | your email |
| Audience/User type | `External` for personal Gmail testing |
| Developer contact email | your email |

Save/continue.

If Google asks for scopes, you can skip for now or add them later. For beginner testing, the important part is that the APIs are enabled and the test user is added.

### Step 5: Add Yourself as a Test User

If your OAuth app is in testing mode, Google blocks users who are not test users.

Open:

```text
Google Auth Platform > Audience
```

or:

```text
OAuth consent screen > Test users
```

Add the same Gmail address you will use when clicking `Sign in with Google` in n8n.

### Step 6: Create OAuth Client

Open:

```text
Google Auth Platform > Clients
```

or in older Google Cloud UI:

```text
APIs & Services > Credentials
```

Click:

```text
Create Client
```

or:

```text
Create Credentials > OAuth client ID
```

Set:

| Field | Value |
| --- | --- |
| Application type | `Web application` |
| Name | `n8n local OAuth client` |

Find:

```text
Authorized redirect URIs
```

Click:

```text
Add URI
```

Paste the exact redirect URL from n8n:

```text
http://localhost:5678/rest/oauth2-credential/callback
```

Click:

```text
Create
```

### Step 7: Copy Client ID and Client Secret

Google will show a popup with:

```text
Client ID
Client Secret
```

Copy both.

Important: Google may only show the client secret when the client is created. Store it somewhere safe.

### Step 8: Paste into n8n

Go back to your n8n credential screen.

Paste:

| n8n Field | Google Value |
| --- | --- |
| Client ID | Google `Client ID` |
| Client Secret | Google `Client Secret` |

Leave:

```text
Allowed HTTP Request Domains = All
```

Then click:

```text
Sign in with Google
```

Choose your Google account and approve access.

### Can You Reuse the Same Client ID and Secret?

Yes. For this project, you can usually use the **same Google OAuth Client ID and Client Secret** for:

- Google Sheets credential
- Google Calendar credential
- Gmail credential

But you must enable the matching APIs in the same Google Cloud project:

- Sheets credential needs Google Sheets API and Google Drive API
- Calendar credential needs Google Calendar API
- Gmail credential needs Gmail API

If n8n shows the same redirect URL for all Google credentials, the same OAuth client works.

If n8n shows a different redirect URL, add that extra redirect URL to the same Google OAuth client under:

```text
Authorized redirect URIs
```

### Common Google Credential Errors

#### redirect_uri_mismatch

Cause:

```text
The redirect URL in Google Cloud does not exactly match n8n.
```

Fix:

Copy the n8n `OAuth Redirect URL` again and paste it into Google Cloud exactly.

Check:

- `http` vs `https`
- `localhost` vs `127.0.0.1`
- port `5678`
- `/rest/oauth2-credential/callback`
- no extra slash at the end

#### Access blocked

Cause:

```text
Your app is in testing mode and your Gmail is not added as a test user.
```

Fix:

Add your Gmail under:

```text
OAuth consent screen > Test users
```

#### API has not been used or is disabled

Cause:

```text
The API is not enabled in Google Cloud.
```

Fix:

Enable the needed API:

- Google Sheets API
- Google Drive API
- Google Calendar API
- Gmail API

#### n8n opens blank or login loops locally

Start n8n like this:

```powershell
$env:N8N_SECURE_COOKIE='false'
n8n
```

Then use:

```text
http://localhost:5678
```

### OpenRouter Credential Option A: Environment Variable

If you run n8n locally in PowerShell, start it like this:

```powershell
$env:N8N_SECURE_COOKIE='false'
$env:OPENROUTER_API_KEY='replace-with-openrouter-api-key'
$env:OPENROUTER_MODEL='openai/gpt-4o-mini'
$env:APP_URL='http://localhost:5678'
n8n
```

Then in n8n expressions you can use:

```text
{{$env.OPENROUTER_API_KEY}}
{{$env.OPENROUTER_MODEL}}
{{$env.APP_URL}}
```

### OpenRouter Credential Option B: Header Auth

If you do not want to use environment variables:

1. Create a credential called `OpenRouter Header Auth`.
2. Credential type: `Header Auth`.
3. Name: `Authorization`.
4. Value:

```text
Bearer replace-with-openrouter-api-key
```

Then in the HTTP Request node, set authentication to this credential.

## 4. Google Sheet Setup

Create a Google Sheet named:

```text
Gym Sales Automation OS - CRM
```

Create these tabs:

```text
Leads
Members
Interactions
Automation Logs
Campaigns
Tasks
Settings
Dashboard
```

Use the column names from:

```text
docs/google-sheets-schema.md
```

Do not change column names unless you also update this guide.

## 5. How to Add and Name Nodes

In the n8n editor:

1. Click `Add first step` or the `+` button.
2. Search for the node name, for example `Webhook`.
3. Click the node.
4. Click the node title at the top of the panel.
5. Rename it exactly as written in this guide.

Example:

```text
Node type: Webhook
Node name: Lead Intake Webhook
```

Names matter because Code nodes will reference nodes like this:

```js
$node["Normalize and Validate Lead"].json
```

## 6. Workflow 01 Overview

Workflow name:

```text
01 - Lead Intake and Qualification
```

This workflow will:

1. Receive a new lead.
2. Validate the lead.
3. Search Google Sheets for duplicate email/phone.
4. If duplicate conflict exists, create a manual task.
5. Call OpenRouter to qualify the lead.
6. Parse and validate AI JSON.
7. Add or update the lead in Google Sheets.
8. Decide whether to email, queue manual follow-up, or skip.
9. Log the interaction.
10. Log the automation result.
11. Respond to the webhook.

## 7. Workflow 01 Node Map

Build these nodes in this order:

```text
Lead Intake Webhook
  -> Normalize and Validate Lead
  -> Is Payload Valid?

Is Payload Valid? false
  -> Prepare Invalid Payload Log
  -> Log Invalid Payload
  -> Respond Invalid Payload

Is Payload Valid? true
  -> Search Lead by Email
  -> Search Lead by Phone
  -> Decide Dedupe
  -> Is Dedupe Conflict?

Is Dedupe Conflict? true
  -> Prepare Dedupe Conflict Task
  -> Add Dedupe Conflict Task
  -> Log Dedupe Conflict
  -> Respond Dedupe Conflict

Is Dedupe Conflict? false
  -> Prepare OpenRouter Request
  -> Qualify Lead with OpenRouter
  -> Parse AI Qualification
  -> Prepare Lead Row
  -> Upsert Lead Row
  -> Decide Follow-Up Route
  -> Follow-Up Route Switch

Follow-Up Route Switch: send_email
  -> Prepare First Reply Email
  -> Send First Reply Email
  -> Log Email Interaction
  -> Log Email Automation
  -> Respond Success

Follow-Up Route Switch: queue_manual
  -> Prepare Manual Follow-Up Task
  -> Add Manual Follow-Up Task
  -> Log Queued Interaction
  -> Log Queued Automation
  -> Respond Queued

Follow-Up Route Switch: skip
  -> Prepare Skipped Interaction
  -> Log Skipped Interaction
  -> Log Skipped Automation
  -> Respond Skipped

Follow-Up Route Switch: manual_review
  -> Prepare Manual Review Task
  -> Add Manual Review Task
  -> Log Manual Review Interaction
  -> Log Manual Review Automation
  -> Respond Manual Review
```

That looks long, but many nodes are simple Google Sheets rows. Keep this as one workflow canvas so every node reference stays inside the same workflow and n8n can always find the named nodes.

## 8. Workflow 01 Detailed Build

### Node 1: Lead Intake Webhook

Add node:

```text
Webhook
```

Rename it:

```text
Lead Intake Webhook
```

Set:

| Setting | Value |
| --- | --- |
| HTTP Method | `POST` |
| Path | `lead-intake` |
| Authentication | `None` while testing |
| Respond | `Using Respond to Webhook Node` |

Later, after testing, you can add Header Auth. For now, keep it simple.

Click:

```text
Listen for test event
```

Test it by sending this JSON to the test webhook URL:

```json
{
  "event_id": "test_001",
  "event_type": "lead.created",
  "received_at": "2026-05-25T10:00:00.000Z",
  "source": "website",
  "lead": {
    "name": "Claire Martin",
    "email": "claire@example.com",
    "phone": "+33601020304",
    "original_message": "Bonjour, je voudrais faire une seance d'essai cette semaine pour perdre du poids.",
    "fitness_goal": "weight_loss",
    "interested_service": "personal_training",
    "preferred_channel": "email",
    "consent_status": "yes",
    "opted_out": false
  }
}
```

PowerShell test command:

```powershell
$body = @{
  event_id = "test_001"
  event_type = "lead.created"
  received_at = "2026-05-25T10:00:00.000Z"
  source = "website"
  lead = @{
    name = "Claire Martin"
    email = "claire@example.com"
    phone = "+33601020304"
    original_message = "Bonjour, je voudrais faire une seance d'essai cette semaine pour perdre du poids."
    fitness_goal = "weight_loss"
    interested_service = "personal_training"
    preferred_channel = "email"
    consent_status = "yes"
    opted_out = $false
  }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method Post -Uri "PASTE_TEST_WEBHOOK_URL_HERE" -ContentType "application/json" -Body $body
```

### Node 2: Normalize and Validate Lead

Add node after `Lead Intake Webhook`:

```text
Code
```

Rename it:

```text
Normalize and Validate Lead
```

Set:

| Setting | Value |
| --- | --- |
| Mode | `Run Once for All Items` |
| Language | `JavaScript` |

Paste this code:

```js
function clean(value) {
  return String(value ?? "").trim();
}

function cleanLower(value) {
  return clean(value).toLowerCase();
}

function toBoolean(value) {
  if (value === true) return true;
  if (value === false) return false;
  const text = cleanLower(value);
  return ["true", "yes", "1", "y"].includes(text);
}

function makeId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}

const webhookOutput = $input.first().json || {};

// n8n Webhook nodes usually output:
// { headers, params, query, body }
// The actual POST data is inside body.
// This fallback also works if a future node passes the lead data directly.
const input = webhookOutput.body || webhookOutput;
const leadInput = input.lead || input;

const normalized = {
  event_id: clean(input.event_id) || makeId("evt"),
  event_type: clean(input.event_type) || "lead.created",
  received_at: clean(input.received_at) || new Date().toISOString(),
  source: clean(input.source || leadInput.source) || "unknown",
  workflow_name: "01 - Lead Intake and Qualification",
  lead: {
    name: clean(leadInput.name),
    email: cleanLower(leadInput.email),
    phone: clean(leadInput.phone),
    original_message: clean(leadInput.original_message || leadInput.message),
    fitness_goal: clean(leadInput.fitness_goal),
    interested_service: clean(leadInput.interested_service) || "unknown",
    preferred_channel: cleanLower(leadInput.preferred_channel) || "email",
    consent_status: cleanLower(leadInput.consent_status) || "unknown",
    opted_out: toBoolean(leadInput.opted_out),
  },
};

const errors = [];

if (!normalized.lead.name) {
  errors.push("Lead name is required");
}

if (!normalized.lead.email && !normalized.lead.phone) {
  errors.push("Lead email or phone is required");
}

if (!["yes", "no", "unknown"].includes(normalized.lead.consent_status)) {
  errors.push("consent_status must be yes, no, or unknown");
}

return [
  {
    json: {
      ...normalized,
      valid: errors.length === 0,
      validation_errors: errors,
      now: new Date().toISOString(),
    },
  },
];
```

### Node 3: Is Payload Valid?

Add node:

```text
IF
```

Rename it:

```text
Is Payload Valid?
```

Set condition:

| Field | Value |
| --- | --- |
| Value 1 | `{{$json.valid}}` |
| Operation | `is true` |

Connect:

```text
Normalize and Validate Lead -> Is Payload Valid?
```

You now have two outputs:

- `true`
- `false`

#### False Branch: Invalid Payload

From the `false` output, add these nodes.

### Node 4F: Prepare Invalid Payload Log

Add node:

```text
Code
```

Rename it:

```text
Prepare Invalid Payload Log
```

Paste:

```js
function makeId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}

const item = $input.first().json;
const message = (item.validation_errors || []).join("; ") || "Invalid payload";

return [
  {
    json: {
      log_id: makeId("log"),
      workflow_name: item.workflow_name || "01 - Lead Intake and Qualification",
      trigger_event: item.event_type || "lead.created",
      entity_type: "lead",
      entity_id: "",
      action_taken: "Rejected invalid lead payload",
      status: "failed",
      error_message: message,
      created_at: new Date().toISOString(),
      response: {
        ok: false,
        status: "invalid_payload",
        error: message,
      },
    },
  },
];
```

### Node 5F: Log Invalid Payload

Add node:

```text
Google Sheets
```

Rename it:

```text
Log Invalid Payload
```

Set:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Automation Logs` |
| Mapping Mode | Map each column manually |

Map columns:

| Google Sheet column | n8n expression |
| --- | --- |
| `log_id` | `{{$json.log_id}}` |
| `workflow_name` | `{{$json.workflow_name}}` |
| `trigger_event` | `{{$json.trigger_event}}` |
| `entity_type` | `{{$json.entity_type}}` |
| `entity_id` | `{{$json.entity_id}}` |
| `action_taken` | `{{$json.action_taken}}` |
| `status` | `{{$json.status}}` |
| `error_message` | `{{$json.error_message}}` |
| `created_at` | `{{$json.created_at}}` |

### Node 6F: Respond Invalid Payload

Add node:

```text
Respond to Webhook
```

Rename it:

```text
Respond Invalid Payload
```

Set:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `422` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Invalid Payload Log"].json.response) }}` |

This finishes the invalid branch.

#### True Branch: Continue Lead Processing

Return to `Is Payload Valid?` and use the `true` output.

### Node 4: Search Lead by Email

Add node:

```text
Google Sheets
```

Rename it:

```text
Search Lead by Email
```

Set:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Get Row(s)` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Leads` |
| Return All | `Off` |
| Limit | `1` |

Filter:

| Column | Operation | Value |
| --- | --- | --- |
| `email` | equals | `{{$node["Normalize and Validate Lead"].json.lead.email || "__no_email__"}}` |

Open the node's `Settings` tab and turn on:

```text
Always Output Data
```

This is important. It allows the workflow to continue even when no lead is found.

### Node 5: Search Lead by Phone

Add node:

```text
Google Sheets
```

Rename it:

```text
Search Lead by Phone
```

Set:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Get Row(s)` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Leads` |
| Return All | `Off` |
| Limit | `1` |

Filter:

| Column | Operation | Value |
| --- | --- | --- |
| `phone` | equals | `{{$node["Normalize and Validate Lead"].json.lead.phone || "__no_phone__"}}` |

Open the node's `Settings` tab and turn on:

```text
Always Output Data
```

Connect:

```text
Search Lead by Email -> Search Lead by Phone
```

### Node 6: Decide Dedupe

Add node:

```text
Code
```

Rename it:

```text
Decide Dedupe
```

Paste:

```js
function makeId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}

function safeItems(nodeName) {
  try {
    return $items(nodeName);
  } catch (error) {
    return [];
  }
}

function isRealSheetRow(row) {
  if (!row || typeof row !== "object") return false;
  return Boolean(row.lead_id || row.email || row.phone || row.name);
}

function firstRealRow(nodeName) {
  const items = safeItems(nodeName);
  for (const item of items) {
    if (isRealSheetRow(item.json)) {
      return item.json;
    }
  }
  return null;
}

function getRowNumber(row) {
  if (!row) return "";
  return (
    row.row_number ||
    row.rowNumber ||
    row.__rowNum__ ||
    row.rowIndex ||
    row.id ||
    ""
  );
}

const original = $node["Normalize and Validate Lead"].json;
const emailRow = firstRealRow("Search Lead by Email");
const phoneRow = firstRealRow("Search Lead by Phone");

let dedupeStatus = "new";
let existingRow = null;
let conflictReason = "";

if (emailRow && phoneRow && emailRow.lead_id && phoneRow.lead_id && emailRow.lead_id !== phoneRow.lead_id) {
  dedupeStatus = "conflict";
  conflictReason = `Email matched ${emailRow.lead_id}, phone matched ${phoneRow.lead_id}`;
} else if (emailRow) {
  dedupeStatus = "existing";
  existingRow = emailRow;
} else if (phoneRow) {
  dedupeStatus = "existing";
  existingRow = phoneRow;
}

const leadId = existingRow?.lead_id || makeId("lead");

return [
  {
    json: {
      ...original,
      lead_id: leadId,
      dedupe_status: dedupeStatus,
      existing_row: existingRow,
      existing_row_number: getRowNumber(existingRow),
      conflict_reason: conflictReason,
      email_match_lead_id: emailRow?.lead_id || "",
      phone_match_lead_id: phoneRow?.lead_id || "",
    },
  },
];
```

### Node 7: Is Dedupe Conflict?

Add node:

```text
IF
```

Rename it:

```text
Is Dedupe Conflict?
```

Condition:

| Field | Value |
| --- | --- |
| Value 1 | `{{$json.dedupe_status}}` |
| Operation | `equals` |
| Value 2 | `conflict` |

The `true` output is the conflict branch.

The `false` output continues to OpenRouter.

#### True Branch: Dedupe Conflict

### Node 8C: Prepare Dedupe Conflict Task

Add node from the `true` output:

```text
Code
```

Rename it:

```text
Prepare Dedupe Conflict Task
```

Paste:

```js
function makeId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}

const item = $input.first().json;
const now = new Date().toISOString();

return [
  {
    json: {
      ...item,
      task: {
        task_id: makeId("task"),
        owner: "Gym Owner",
        entity_type: "lead",
        entity_id: "",
        task_type: "follow_up",
        priority: "high",
        due_at: now,
        status: "open",
        notes: `Duplicate conflict. ${item.conflict_reason}. Lead name: ${item.lead.name}. Email: ${item.lead.email}. Phone: ${item.lead.phone}. Review manually before automation.`,
        created_at: now,
      },
      log: {
        log_id: makeId("log"),
        workflow_name: item.workflow_name,
        trigger_event: item.event_type,
        entity_type: "lead",
        entity_id: "",
        action_taken: "Duplicate conflict detected",
        status: "failed",
        error_message: item.conflict_reason,
        created_at: now,
      },
      response: {
        ok: false,
        status: "duplicate_conflict",
        message: item.conflict_reason,
      },
    },
  },
];
```

### Node 9C: Add Dedupe Conflict Task

Add node:

```text
Google Sheets
```

Rename it:

```text
Add Dedupe Conflict Task
```

Set:

| Setting | Value |
| --- | --- |
| Operation | `Append Row` |
| Sheet | `Tasks` |

Map columns:

| Column | Expression |
| --- | --- |
| `task_id` | `{{$json.task.task_id}}` |
| `owner` | `{{$json.task.owner}}` |
| `entity_type` | `{{$json.task.entity_type}}` |
| `entity_id` | `{{$json.task.entity_id}}` |
| `task_type` | `{{$json.task.task_type}}` |
| `priority` | `{{$json.task.priority}}` |
| `due_at` | `{{$json.task.due_at}}` |
| `status` | `{{$json.task.status}}` |
| `notes` | `{{$json.task.notes}}` |
| `created_at` | `{{$json.task.created_at}}` |

### Node 10C: Log Dedupe Conflict

Add node:

```text
Google Sheets
```

Rename it:

```text
Log Dedupe Conflict
```

Set:

| Setting | Value |
| --- | --- |
| Operation | `Append Row` |
| Sheet | `Automation Logs` |

Map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Dedupe Conflict Task"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Dedupe Conflict Task"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Dedupe Conflict Task"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Dedupe Conflict Task"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Dedupe Conflict Task"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Dedupe Conflict Task"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Dedupe Conflict Task"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Dedupe Conflict Task"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Dedupe Conflict Task"].json.log.created_at}}` |

### Node 11C: Respond Dedupe Conflict

Add:

```text
Respond to Webhook
```

Rename:

```text
Respond Dedupe Conflict
```

Set:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `409` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Dedupe Conflict Task"].json.response) }}` |

#### False Branch: OpenRouter Qualification

Go back to `Is Dedupe Conflict?` and use the `false` output.

### Node 8: Prepare OpenRouter Request

Add node:

```text
Code
```

Rename it:

```text
Prepare OpenRouter Request
```

Paste:

```js
const item = $input.first().json;

// Replace this model if you choose a different OpenRouter model.
// Use a model that supports structured outputs / JSON schema.
const model = "openai/gpt-4o-mini";

const systemMessage = `
You are the AI qualification assistant for a French gym sales team.

Your job is to classify a lead, summarize intent, recommend the next action, and draft a short French reply.

Rules:
- Return only JSON.
- Do not provide medical advice.
- Do not diagnose health conditions.
- Do not promise guaranteed fitness results.
- Do not invent prices, discounts, schedules, or availability.
- If consent is missing or denied, recommend manual review instead of automated marketing.
- Keep the French reply friendly, concise, and natural.
`.trim();

const leadForAi = {
  name: item.lead.name,
  email: item.lead.email,
  phone: item.lead.phone,
  source: item.source,
  original_message: item.lead.original_message,
  fitness_goal: item.lead.fitness_goal,
  interested_service: item.lead.interested_service,
  preferred_channel: item.lead.preferred_channel,
  consent_status: item.lead.consent_status,
  opted_out: item.lead.opted_out,
};

const userMessage = `
Classify this gym lead.

Lead data:
${JSON.stringify(leadForAi, null, 2)}

Return only the JSON object that matches the schema.
`.trim();

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "lead_temperature",
    "lead_score",
    "intent",
    "interested_service",
    "fitness_goal",
    "urgency",
    "budget_sensitivity",
    "preferred_channel",
    "summary",
    "recommended_next_action",
    "suggested_reply_fr",
    "risk_flags",
    "automation_allowed"
  ],
  properties: {
    lead_temperature: {
      type: "string",
      enum: ["hot", "warm", "cold"]
    },
    lead_score: {
      type: "integer",
      minimum: 0,
      maximum: 100
    },
    intent: {
      type: "string",
      enum: [
        "trial_booking",
        "pricing_question",
        "membership_question",
        "class_question",
        "personal_training",
        "pilates",
        "supplements",
        "general_inquiry",
        "complaint",
        "other"
      ]
    },
    interested_service: {
      type: "string",
      enum: ["membership", "personal_training", "pilates", "supplements", "premium_plan", "unknown"]
    },
    fitness_goal: {
      type: "string",
      minLength: 0,
      maxLength: 200
    },
    urgency: {
      type: "string",
      enum: ["today", "this_week", "this_month", "not_specified"]
    },
    budget_sensitivity: {
      type: "string",
      enum: ["high", "medium", "low", "unknown"]
    },
    preferred_channel: {
      type: "string",
      enum: ["email", "whatsapp", "sms", "call", "unknown"]
    },
    summary: {
      type: "string",
      minLength: 1,
      maxLength: 500
    },
    recommended_next_action: {
      type: "string",
      minLength: 1,
      maxLength: 300
    },
    suggested_reply_fr: {
      type: "string",
      minLength: 1,
      maxLength: 700
    },
    risk_flags: {
      type: "array",
      items: {
        type: "string",
        enum: [
          "no_consent",
          "opted_out",
          "medical_advice_requested",
          "complaint",
          "price_sensitive",
          "manual_review_needed"
        ]
      },
      uniqueItems: true
    },
    automation_allowed: {
      type: "boolean"
    }
  }
};

const openrouterBody = {
  model,
  messages: [
    {
      role: "system",
      content: systemMessage
    },
    {
      role: "user",
      content: userMessage
    }
  ],
  temperature: 0.2,
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "lead_qualification",
      strict: true,
      schema
    }
  }
};

return [
  {
    json: {
      ...item,
      ai_system_message: systemMessage,
      ai_user_message: userMessage,
      openrouter_body: openrouterBody,
    },
  },
];
```

### Node 9: Qualify Lead with OpenRouter

Add node:

```text
HTTP Request
```

Rename it:

```text
Qualify Lead with OpenRouter
```

Set:

| Setting | Value |
| --- | --- |
| Method | `POST` |
| URL | `https://openrouter.ai/api/v1/chat/completions` |
| Authentication | `None` if using manual headers |
| Send Headers | `On` |
| Send Body | `On` |
| Body Content Type | `JSON` |
| Specify Body | `Using JSON` |
| Response Format | `JSON` |

Headers:

| Name | Value |
| --- | --- |
| `Authorization` | `Bearer YOUR_OPENROUTER_API_KEY` |
| `Content-Type` | `application/json` |
| `HTTP-Referer` | `http://localhost:5678` |
| `X-OpenRouter-Title` | `Gym Sales Automation OS` |

If you started n8n with `$env:OPENROUTER_API_KEY`, use this expression instead of pasting the key:

```text
Bearer {{$env.OPENROUTER_API_KEY}}
```

JSON body:

```text
={{ $json.openrouter_body }}
```

If n8n does not accept that in your body editor, switch the body field to expression mode and paste the same expression.

### Node 10: Parse AI Qualification

Add node:

```text
Code
```

Rename it:

```text
Parse AI Qualification
```

Paste:

```js
const source = $node["Prepare OpenRouter Request"].json;
const response = $input.first().json;

let content = response.choices?.[0]?.message?.content;

if (!content) {
  throw new Error("OpenRouter response did not include choices[0].message.content");
}

let ai;

if (typeof content === "object") {
  ai = content;
} else {
  try {
    ai = JSON.parse(content);
  } catch (error) {
    throw new Error(`Could not parse OpenRouter JSON: ${error.message}. Raw content: ${content}`);
  }
}

const required = [
  "lead_temperature",
  "lead_score",
  "intent",
  "interested_service",
  "fitness_goal",
  "urgency",
  "budget_sensitivity",
  "preferred_channel",
  "summary",
  "recommended_next_action",
  "suggested_reply_fr",
  "risk_flags",
  "automation_allowed",
];

for (const key of required) {
  if (!(key in ai)) {
    throw new Error(`AI response missing required field: ${key}`);
  }
}

if (!Array.isArray(ai.risk_flags)) {
  ai.risk_flags = [];
}

const score = Number(ai.lead_score);
if (!Number.isFinite(score) || score < 0 || score > 100) {
  throw new Error(`AI lead_score must be a number from 0 to 100. Got: ${ai.lead_score}`);
}
ai.lead_score = Math.round(score);

return [
  {
    json: {
      ...source,
      ai,
      openrouter_usage: response.usage || null,
      now: new Date().toISOString(),
    },
  },
];
```

### Node 11: Prepare Lead Row

Add node:

```text
Code
```

Rename it:

```text
Prepare Lead Row
```

Paste:

```js
const item = $input.first().json;
const ai = item.ai;
const existing = item.existing_row || {};
const now = new Date().toISOString();

function existingOptedOut(row) {
  const value = row.opted_out;
  if (value === true) return true;
  return String(value || "").toUpperCase() === "TRUE";
}

const optedOut = existingOptedOut(existing) || item.lead.opted_out || ai.risk_flags.includes("opted_out");

const lifecycleStage = ai.intent === "trial_booking"
  ? "trial_requested"
  : (existing.lifecycle_stage || "new");

const leadRow = {
  lead_id: item.lead_id,
  name: item.lead.name,
  email: item.lead.email,
  phone: item.lead.phone,
  source: item.source,
  original_message: item.lead.original_message,
  fitness_goal: ai.fitness_goal || item.lead.fitness_goal,
  interested_service: ai.interested_service || item.lead.interested_service,
  lead_temperature: ai.lead_temperature,
  lead_score: ai.lead_score,
  lifecycle_stage: lifecycleStage,
  consent_status: item.lead.consent_status,
  preferred_channel: ai.preferred_channel || item.lead.preferred_channel,
  ai_summary: ai.summary,
  next_action: ai.recommended_next_action,
  assigned_to: existing.assigned_to || "Gym Owner",
  created_at: existing.created_at || now,
  updated_at: now,
  last_contacted_at: existing.last_contacted_at || "",
  opted_out: optedOut ? "TRUE" : "FALSE",
};

return [
  {
    json: {
      ...item,
      lead_row: leadRow,
      lifecycle_stage: lifecycleStage,
      opted_out_final: optedOut,
    },
  },
];
```

### Node 12: Upsert Lead Row

Add node:

```text
Google Sheets
```

Rename it:

```text
Upsert Lead Row
```

Set:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Leads` |
| Column to Match On / Matching Column | `lead_id` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `lead_id` | `{{$json.lead_row.lead_id}}` |
| `name` | `{{$json.lead_row.name}}` |
| `email` | `{{$json.lead_row.email}}` |
| `phone` | `{{$json.lead_row.phone}}` |
| `source` | `{{$json.lead_row.source}}` |
| `original_message` | `{{$json.lead_row.original_message}}` |
| `fitness_goal` | `{{$json.lead_row.fitness_goal}}` |
| `interested_service` | `{{$json.lead_row.interested_service}}` |
| `lead_temperature` | `{{$json.lead_row.lead_temperature}}` |
| `lead_score` | `{{$json.lead_row.lead_score}}` |
| `lifecycle_stage` | `{{$json.lead_row.lifecycle_stage}}` |
| `consent_status` | `{{$json.lead_row.consent_status}}` |
| `preferred_channel` | `{{$json.lead_row.preferred_channel}}` |
| `ai_summary` | `{{$json.lead_row.ai_summary}}` |
| `next_action` | `{{$json.lead_row.next_action}}` |
| `assigned_to` | `{{$json.lead_row.assigned_to}}` |
| `created_at` | `{{$json.lead_row.created_at}}` |
| `updated_at` | `{{$json.lead_row.updated_at}}` |
| `last_contacted_at` | `{{$json.lead_row.last_contacted_at}}` |
| `opted_out` | `{{$json.lead_row.opted_out}}` |

Important: after this node, the current JSON may become the Google Sheets output. For later expressions, use:

```text
{{$node["Prepare Lead Row"].json...}}
```

### Node 13: Decide Follow-Up Route

Add node after `Upsert Lead Row`:

```text
Code
```

Rename it:

```text
Decide Follow-Up Route
```

Paste:

```js
const item = $node["Prepare Lead Row"].json;
const ai = item.ai;
const lead = item.lead;
const flags = ai.risk_flags || [];

let followUpRoute = "manual_review";
let routeReason = "";

if (lead.opted_out || item.opted_out_final || flags.includes("opted_out")) {
  followUpRoute = "skip";
  routeReason = "Lead is opted out";
} else if (lead.consent_status === "no" || flags.includes("no_consent")) {
  followUpRoute = "skip";
  routeReason = "Lead has no marketing consent";
} else if (lead.consent_status === "unknown") {
  followUpRoute = "queue_manual";
  routeReason = "Consent is unknown, manual review required";
} else if (flags.includes("medical_advice_requested") || flags.includes("manual_review_needed") || ai.intent === "complaint") {
  followUpRoute = "manual_review";
  routeReason = "AI flagged this lead for manual review";
} else if (ai.automation_allowed === true && lead.email) {
  followUpRoute = "send_email";
  routeReason = "Consent is yes and email is available";
} else {
  followUpRoute = "queue_manual";
  routeReason = "No safe automatic email route";
}

return [
  {
    json: {
      ...item,
      follow_up_route: followUpRoute,
      route_reason: routeReason,
    },
  },
];
```

### Node 14: Follow-Up Route Switch

Add node:

```text
Switch
```

Rename it:

```text
Follow-Up Route Switch
```

Set:

| Setting | Value |
| --- | --- |
| Mode | `Rules` |

Create four routing rules.

Rule 1:

| Field | Value |
| --- | --- |
| Value 1 | `{{$json.follow_up_route}}` |
| Operation | `equals` |
| Value 2 | `send_email` |

Rule 2:

| Field | Value |
| --- | --- |
| Value 1 | `{{$json.follow_up_route}}` |
| Operation | `equals` |
| Value 2 | `queue_manual` |

Rule 3:

| Field | Value |
| --- | --- |
| Value 1 | `{{$json.follow_up_route}}` |
| Operation | `equals` |
| Value 2 | `skip` |

Rule 4:

| Field | Value |
| --- | --- |
| Value 1 | `{{$json.follow_up_route}}` |
| Operation | `equals` |
| Value 2 | `manual_review` |

The Switch node will show multiple outputs. Connect each output to the matching branch below.

## 9. Follow-Up Branch 1: send_email

### Node 15A: Prepare First Reply Email

Add node from the `send_email` output:

```text
Code
```

Rename:

```text
Prepare First Reply Email
```

Paste:

```js
function makeId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}

const item = $input.first().json;
const ai = item.ai;
const lead = item.lead;
const now = new Date().toISOString();

const subject = "Votre demande chez Elite Club";

const body = `
Bonjour ${lead.name},

Merci pour votre message. Nous avons bien recu votre demande concernant ${ai.interested_service}.

${ai.suggested_reply_fr}

Si vous le souhaitez, nous pouvons vous proposer un creneau pour echanger ou organiser une seance d'essai.

Sportivement,
L'equipe Elite Club
`.trim();

return [
  {
    json: {
      ...item,
      email: {
        to: lead.email,
        subject,
        body,
      },
      interaction: {
        interaction_id: makeId("int"),
        person_type: "lead",
        person_id: item.lead_id,
        channel: "email",
        direction: "outbound",
        message: body,
        ai_generated: "TRUE",
        sent_status: "sent",
        created_at: now,
      },
      log: {
        log_id: makeId("log"),
        workflow_name: item.workflow_name,
        trigger_event: item.event_type,
        entity_type: "lead",
        entity_id: item.lead_id,
        action_taken: "Lead qualified and first email sent",
        status: "success",
        error_message: "",
        created_at: now,
      },
      response: {
        ok: true,
        status: "email_sent",
        lead_id: item.lead_id,
        lead_temperature: ai.lead_temperature,
        lead_score: ai.lead_score,
      },
    },
  },
];
```

### Node 16A: Send First Reply Email

Add node:

```text
Gmail
```

Rename:

```text
Send First Reply Email
```

Set:

| Setting | Value |
| --- | --- |
| Credential | `Elite Club Gmail` |
| Resource | `Message` |
| Operation | `Send` |
| To | `{{$json.email.to}}` |
| Subject | `{{$json.email.subject}}` |
| Email Type | `Text` |
| Message | `{{$json.email.body}}` |

### Node 17A: Log Email Interaction

Add node:

```text
Google Sheets
```

Rename:

```text
Log Email Interaction
```

Operation:

```text
Append Row
```

Sheet:

```text
Interactions
```

Map:

| Column | Expression |
| --- | --- |
| `interaction_id` | `{{$node["Prepare First Reply Email"].json.interaction.interaction_id}}` |
| `person_type` | `{{$node["Prepare First Reply Email"].json.interaction.person_type}}` |
| `person_id` | `{{$node["Prepare First Reply Email"].json.interaction.person_id}}` |
| `channel` | `{{$node["Prepare First Reply Email"].json.interaction.channel}}` |
| `direction` | `{{$node["Prepare First Reply Email"].json.interaction.direction}}` |
| `message` | `{{$node["Prepare First Reply Email"].json.interaction.message}}` |
| `ai_generated` | `{{$node["Prepare First Reply Email"].json.interaction.ai_generated}}` |
| `sent_status` | `{{$node["Prepare First Reply Email"].json.interaction.sent_status}}` |
| `created_at` | `{{$node["Prepare First Reply Email"].json.interaction.created_at}}` |

### Node 18A: Log Email Automation

Add node:

```text
Google Sheets
```

Rename:

```text
Log Email Automation
```

Operation:

```text
Append Row
```

Sheet:

```text
Automation Logs
```

Map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare First Reply Email"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare First Reply Email"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare First Reply Email"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare First Reply Email"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare First Reply Email"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare First Reply Email"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare First Reply Email"].json.log.status}}` |
| `error_message` | `{{$node["Prepare First Reply Email"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare First Reply Email"].json.log.created_at}}` |

### Node 19A: Respond Success

Add:

```text
Respond to Webhook
```

Rename:

```text
Respond Success
```

Set:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare First Reply Email"].json.response) }}` |

## 10. Follow-Up Branch 2: queue_manual

### Node 15B: Prepare Manual Follow-Up Task

Add node from the `queue_manual` output:

```text
Code
```

Rename:

```text
Prepare Manual Follow-Up Task
```

Paste:

```js
function makeId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}

const item = $input.first().json;
const now = new Date().toISOString();

return [
  {
    json: {
      ...item,
      task: {
        task_id: makeId("task"),
        owner: "Gym Owner",
        entity_type: "lead",
        entity_id: item.lead_id,
        task_type: "follow_up",
        priority: item.ai.lead_temperature === "hot" ? "high" : "medium",
        due_at: now,
        status: "open",
        notes: `Manual follow-up needed. Reason: ${item.route_reason}. Suggested reply: ${item.ai.suggested_reply_fr}`,
        created_at: now,
      },
      interaction: {
        interaction_id: makeId("int"),
        person_type: "lead",
        person_id: item.lead_id,
        channel: item.lead.preferred_channel || "manual",
        direction: "outbound",
        message: item.ai.suggested_reply_fr,
        ai_generated: "TRUE",
        sent_status: "queued",
        created_at: now,
      },
      log: {
        log_id: makeId("log"),
        workflow_name: item.workflow_name,
        trigger_event: item.event_type,
        entity_type: "lead",
        entity_id: item.lead_id,
        action_taken: `Queued manual follow-up: ${item.route_reason}`,
        status: "queued",
        error_message: "",
        created_at: now,
      },
      response: {
        ok: true,
        status: "manual_follow_up_queued",
        lead_id: item.lead_id,
        reason: item.route_reason,
      },
    },
  },
];
```

### Node 16B: Add Manual Follow-Up Task

Add `Google Sheets` node.

Rename:

```text
Add Manual Follow-Up Task
```

Operation:

```text
Append Row
```

Sheet:

```text
Tasks
```

Map:

| Column | Expression |
| --- | --- |
| `task_id` | `{{$json.task.task_id}}` |
| `owner` | `{{$json.task.owner}}` |
| `entity_type` | `{{$json.task.entity_type}}` |
| `entity_id` | `{{$json.task.entity_id}}` |
| `task_type` | `{{$json.task.task_type}}` |
| `priority` | `{{$json.task.priority}}` |
| `due_at` | `{{$json.task.due_at}}` |
| `status` | `{{$json.task.status}}` |
| `notes` | `{{$json.task.notes}}` |
| `created_at` | `{{$json.task.created_at}}` |

### Node 17B: Log Queued Interaction

Add `Google Sheets` node.

Rename:

```text
Log Queued Interaction
```

Append to:

```text
Interactions
```

Map from the prepare node, not from the previous Google Sheets node:

| Column | Expression |
| --- | --- |
| `interaction_id` | `{{$node["Prepare Manual Follow-Up Task"].json.interaction.interaction_id}}` |
| `person_type` | `{{$node["Prepare Manual Follow-Up Task"].json.interaction.person_type}}` |
| `person_id` | `{{$node["Prepare Manual Follow-Up Task"].json.interaction.person_id}}` |
| `channel` | `{{$node["Prepare Manual Follow-Up Task"].json.interaction.channel}}` |
| `direction` | `{{$node["Prepare Manual Follow-Up Task"].json.interaction.direction}}` |
| `message` | `{{$node["Prepare Manual Follow-Up Task"].json.interaction.message}}` |
| `ai_generated` | `{{$node["Prepare Manual Follow-Up Task"].json.interaction.ai_generated}}` |
| `sent_status` | `{{$node["Prepare Manual Follow-Up Task"].json.interaction.sent_status}}` |
| `created_at` | `{{$node["Prepare Manual Follow-Up Task"].json.interaction.created_at}}` |

### Node 18B: Log Queued Automation

Add `Google Sheets` node.

Rename:

```text
Log Queued Automation
```

Append to:

```text
Automation Logs
```

Map from the prepare node:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Manual Follow-Up Task"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Manual Follow-Up Task"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Manual Follow-Up Task"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Manual Follow-Up Task"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Manual Follow-Up Task"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Manual Follow-Up Task"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Manual Follow-Up Task"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Manual Follow-Up Task"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Manual Follow-Up Task"].json.log.created_at}}` |

### Node 19B: Respond Queued

Add `Respond to Webhook`.

Rename:

```text
Respond Queued
```

Set:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Manual Follow-Up Task"].json.response) }}` |

## 11. Follow-Up Branch 3: skip

### Node 15C: Prepare Skipped Interaction

Add node from the `skip` output:

```text
Code
```

Rename:

```text
Prepare Skipped Interaction
```

Paste:

```js
function makeId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}

const item = $input.first().json;
const now = new Date().toISOString();

return [
  {
    json: {
      ...item,
      interaction: {
        interaction_id: makeId("int"),
        person_type: "lead",
        person_id: item.lead_id,
        channel: "system",
        direction: "internal",
        message: `Skipped outbound message. Reason: ${item.route_reason}`,
        ai_generated: "FALSE",
        sent_status: "skipped",
        created_at: now,
      },
      log: {
        log_id: makeId("log"),
        workflow_name: item.workflow_name,
        trigger_event: item.event_type,
        entity_type: "lead",
        entity_id: item.lead_id,
        action_taken: `Skipped outbound message: ${item.route_reason}`,
        status: "skipped",
        error_message: "",
        created_at: now,
      },
      response: {
        ok: true,
        status: "message_skipped",
        lead_id: item.lead_id,
        reason: item.route_reason,
      },
    },
  },
];
```

### Node 16C: Log Skipped Interaction

Add `Google Sheets` node.

Rename:

```text
Log Skipped Interaction
```

Append to:

```text
Interactions
```

Map from the prepare node:

| Column | Expression |
| --- | --- |
| `interaction_id` | `{{$node["Prepare Skipped Interaction"].json.interaction.interaction_id}}` |
| `person_type` | `{{$node["Prepare Skipped Interaction"].json.interaction.person_type}}` |
| `person_id` | `{{$node["Prepare Skipped Interaction"].json.interaction.person_id}}` |
| `channel` | `{{$node["Prepare Skipped Interaction"].json.interaction.channel}}` |
| `direction` | `{{$node["Prepare Skipped Interaction"].json.interaction.direction}}` |
| `message` | `{{$node["Prepare Skipped Interaction"].json.interaction.message}}` |
| `ai_generated` | `{{$node["Prepare Skipped Interaction"].json.interaction.ai_generated}}` |
| `sent_status` | `{{$node["Prepare Skipped Interaction"].json.interaction.sent_status}}` |
| `created_at` | `{{$node["Prepare Skipped Interaction"].json.interaction.created_at}}` |

### Node 17C: Log Skipped Automation

Add `Google Sheets` node.

Rename:

```text
Log Skipped Automation
```

Append to:

```text
Automation Logs
```

Map from the prepare node:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Skipped Interaction"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Skipped Interaction"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Skipped Interaction"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Skipped Interaction"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Skipped Interaction"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Skipped Interaction"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Skipped Interaction"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Skipped Interaction"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Skipped Interaction"].json.log.created_at}}` |

### Node 18C: Respond Skipped

Add `Respond to Webhook`.

Rename:

```text
Respond Skipped
```

Set:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Skipped Interaction"].json.response) }}` |

## 12. Follow-Up Branch 4: manual_review

This branch is similar to `queue_manual`, but the task is higher priority.

### Node 15D: Prepare Manual Review Task

Add node from the `manual_review` output:

```text
Code
```

Rename:

```text
Prepare Manual Review Task
```

Paste:

```js
function makeId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}

const item = $input.first().json;
const now = new Date().toISOString();

return [
  {
    json: {
      ...item,
      task: {
        task_id: makeId("task"),
        owner: "Gym Owner",
        entity_type: "lead",
        entity_id: item.lead_id,
        task_type: "follow_up",
        priority: "high",
        due_at: now,
        status: "open",
        notes: `Manual review required. Reason: ${item.route_reason}. Risk flags: ${(item.ai.risk_flags || []).join(", ")}. Suggested reply: ${item.ai.suggested_reply_fr}`,
        created_at: now,
      },
      interaction: {
        interaction_id: makeId("int"),
        person_type: "lead",
        person_id: item.lead_id,
        channel: "manual",
        direction: "internal",
        message: `Manual review required. ${item.route_reason}`,
        ai_generated: "TRUE",
        sent_status: "queued",
        created_at: now,
      },
      log: {
        log_id: makeId("log"),
        workflow_name: item.workflow_name,
        trigger_event: item.event_type,
        entity_type: "lead",
        entity_id: item.lead_id,
        action_taken: `Manual review task created: ${item.route_reason}`,
        status: "queued",
        error_message: "",
        created_at: now,
      },
      response: {
        ok: true,
        status: "manual_review_created",
        lead_id: item.lead_id,
        reason: item.route_reason,
      },
    },
  },
];
```

### Node 16D: Add Manual Review Task

Add `Google Sheets` node.

Rename:

```text
Add Manual Review Task
```

Append to:

```text
Tasks
```

Use this mapping:

| Column | Expression |
| --- | --- |
| `task_id` | `{{$node["Prepare Manual Review Task"].json.task.task_id}}` |
| `owner` | `{{$node["Prepare Manual Review Task"].json.task.owner}}` |
| `entity_type` | `{{$node["Prepare Manual Review Task"].json.task.entity_type}}` |
| `entity_id` | `{{$node["Prepare Manual Review Task"].json.task.entity_id}}` |
| `task_type` | `{{$node["Prepare Manual Review Task"].json.task.task_type}}` |
| `priority` | `{{$node["Prepare Manual Review Task"].json.task.priority}}` |
| `due_at` | `{{$node["Prepare Manual Review Task"].json.task.due_at}}` |
| `status` | `{{$node["Prepare Manual Review Task"].json.task.status}}` |
| `notes` | `{{$node["Prepare Manual Review Task"].json.task.notes}}` |
| `created_at` | `{{$node["Prepare Manual Review Task"].json.task.created_at}}` |

### Node 17D: Log Manual Review Interaction

Add `Google Sheets` node.

Rename:

```text
Log Manual Review Interaction
```

Append to:

```text
Interactions
```

Use this mapping:

| Column | Expression |
| --- | --- |
| `interaction_id` | `{{$node["Prepare Manual Review Task"].json.interaction.interaction_id}}` |
| `person_type` | `{{$node["Prepare Manual Review Task"].json.interaction.person_type}}` |
| `person_id` | `{{$node["Prepare Manual Review Task"].json.interaction.person_id}}` |
| `channel` | `{{$node["Prepare Manual Review Task"].json.interaction.channel}}` |
| `direction` | `{{$node["Prepare Manual Review Task"].json.interaction.direction}}` |
| `message` | `{{$node["Prepare Manual Review Task"].json.interaction.message}}` |
| `ai_generated` | `{{$node["Prepare Manual Review Task"].json.interaction.ai_generated}}` |
| `sent_status` | `{{$node["Prepare Manual Review Task"].json.interaction.sent_status}}` |
| `created_at` | `{{$node["Prepare Manual Review Task"].json.interaction.created_at}}` |

### Node 18D: Log Manual Review Automation

Add `Google Sheets` node.

Rename:

```text
Log Manual Review Automation
```

Append to:

```text
Automation Logs
```

Use this mapping:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Manual Review Task"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Manual Review Task"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Manual Review Task"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Manual Review Task"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Manual Review Task"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Manual Review Task"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Manual Review Task"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Manual Review Task"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Manual Review Task"].json.log.created_at}}` |

### Node 19D: Respond Manual Review

Add `Respond to Webhook`.

Rename:

```text
Respond Manual Review
```

Set:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Manual Review Task"].json.response) }}` |

## 13. Workflow 01 Testing

### Test A: Valid Lead

Send the Claire test lead from Node 1.

Expected:

- `Leads` has one row.
- `lead_temperature` is filled.
- `lead_score` is filled.
- `ai_summary` is filled.
- One `Interactions` row exists.
- One `Automation Logs` row exists.
- If consent is `yes`, email branch runs.

### Test B: Duplicate Lead

Send the same lead again.

Expected:

- No second Lead row.
- Existing lead row updates.
- Logs show the new run.

### Test C: Consent Unknown

Change:

```json
"consent_status": "unknown"
```

Expected:

- Lead is saved.
- No email is sent.
- Task is created.
- Interaction is `queued`.

### Test D: Opted Out

Change:

```json
"opted_out": true
```

Expected:

- Lead is saved.
- No email is sent.
- Interaction is `skipped`.
- Automation log is `skipped`.

### Test E: Invalid Payload

Remove the name:

```json
"name": ""
```

Expected:

- No lead row.
- Automation log says invalid payload.
- Webhook returns status `422`.

## 14. Workflow 02: Booking and Trial Follow-Up

Build this only after Workflow 01 works.

Create exactly one n8n workflow:

```text
02 - Booking and Trial Follow-Up
```

Inside that one workflow canvas, build these four route groups:

```text
Route A - Trial Requested - Send Booking Options
Route B - Trial Slot Selected - Create Booking
Route C - Daily Trial Reminder
Route D - Trial Outcome Follow-Up
```

Do **not** create separate workflows named `02A`, `02B`, `02C`, or `02D`. Those labels are only route labels for organization. Keeping all four routes in the same workflow prevents `node not found` errors when an expression references a node by name.

Professional canvas layout:

| Area | What to Put There |
| --- | --- |
| Top-left | Route A trigger and booking-options nodes |
| Top-right | Route B trigger and calendar-booking nodes |
| Bottom-left | Route C daily reminder schedule and branches |
| Bottom-right | Route D trial-outcome webhook and branches |

Each route has its own trigger node. That is okay in n8n. One workflow can contain multiple Webhook and Schedule Trigger nodes as long as each trigger starts its own route and the Webhook paths are unique.

### If You Already Built the Split 02 Version

Use this migration process:

1. Create or open the workflow named `02 - Booking and Trial Follow-Up`.
2. Open your old trial-requested workflow, select all its nodes, copy them, and paste them into the top-left area of the new Workflow 02 canvas.
3. Repeat for the old slot-selected, daily-reminder, and trial-outcome workflows, placing each route in its own area of the same canvas.
4. Keep the node names exactly as written in this guide. If n8n adds `1` or `Copy` to a pasted node name, rename it back before testing expressions.
5. Do not connect Route A, Route B, Route C, and Route D to each other. Each route starts from its own Webhook or Schedule Trigger node.
6. Update the Code nodes so every `workflow_name` value says `02 - Booking and Trial Follow-Up`.
7. Test each route with `Listen for test event` while building.
8. When you are ready to switch production traffic, deactivate the old split workflows first.
9. Activate the new combined workflow and copy the production webhook URLs again if n8n changed them.

If n8n refuses to activate because a webhook path is already registered, that means one of the old split workflows is still active with the same path. Deactivate the old workflow, then activate the combined one.

Test Route A, Route B, Route C, and Route D one by one after migration. Do not test all four at once.

## 14A. Route A - Trial Requested - Send Booking Options

### What This Route Does

When a staff member or another route says a lead wants a trial, this route:

1. Receives `lead_id`.
2. Finds the lead in Google Sheets.
3. Checks consent, opt-out, and email.
4. Sends booking options if allowed.
5. Creates a manual task if not allowed.
6. Updates the lead stage.
7. Logs the interaction and automation result.

### Node Map

```text
Trial Requested Webhook
  -> Normalize Trial Request
  -> Get Lead for Booking
  -> Was Lead Found?

Was Lead Found? false
  -> Prepare Booking Lead Not Found Log
  -> Log Booking Lead Not Found
  -> Respond Booking Lead Not Found

Was Lead Found? true
  -> Can Send Booking Options?

Can Send Booking Options? true
  -> Prepare Booking Options Email
  -> Send Booking Options Email
  -> Prepare Booking Success Records
  -> Update Lead to Trial Options Sent
  -> Log Booking Email Interaction
  -> Log Booking Email Automation
  -> Respond Booking Options Sent

Can Send Booking Options? false
  -> Prepare Booking Manual Task
  -> Add Booking Manual Task
  -> Log Booking Queued Automation
  -> Respond Booking Queued
```

### Node 1: Trial Requested Webhook

Add:

```text
Webhook
```

Rename:

```text
Trial Requested Webhook
```

Settings:

| Setting | Value |
| --- | --- |
| HTTP Method | `POST` |
| Path | `trial-requested` |
| Authentication | `None` while testing |
| Respond | `Using Respond to Webhook Node` |

Test payload:

```json
{
  "lead_id": "lead_001"
}
```

Where to input this payload:

You do **not** paste this JSON inside the Webhook node. The Webhook node only gives you a URL. You send the JSON to that URL from another tool.

Beginner test method using PowerShell:

1. Open the `Trial Requested Webhook` node.
2. Click `Listen for test event`.
3. Copy the `Test URL`. It will look like this:

```text
http://localhost:5678/webhook-test/trial-requested
```

4. Open a new PowerShell window.
5. Paste this command, but replace the URL if your Test URL is different:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5678/webhook-test/trial-requested" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"lead_id":"lead_001"}'
```

6. Go back to n8n. The Webhook node should now show 1 received test item.

Alternative test method using Postman or Thunder Client:

| Field | Value |
| --- | --- |
| Method | `POST` |
| URL | Your n8n `Test URL` |
| Body type | `raw` / `JSON` |
| Body | `{ "lead_id": "lead_001" }` |

Important: `lead_001` must exist in your `Leads` sheet before this route can find the lead. If you created a lead from Workflow 01, use that real `lead_id` instead of `lead_001`.

### Node 2: Normalize Trial Request

Add:

```text
Code
```

Rename:

```text
Normalize Trial Request
```

Mode:

```text
Run Once for All Items
```

Paste:

```js
const webhookOutput = $input.first().json || {};
const input = webhookOutput.body || webhookOutput;

const leadId = String(input.lead_id || "").trim();
const errors = [];

if (!leadId) {
  errors.push("lead_id is required");
}

return [
  {
    json: {
      workflow_name: "02 - Booking and Trial Follow-Up",
      event_type: "trial.requested",
      lead_id: leadId,
      valid: errors.length === 0,
      validation_errors: errors,
      now: new Date().toISOString(),
    },
  },
];
```

### Node 3: Get Lead for Booking

Add:

```text
Google Sheets
```

Rename:

```text
Get Lead for Booking
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Get Row(s)` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Leads` |
| Return All | `Off` |
| Limit | `1` |

Filter:

| Column | Operation | Value |
| --- | --- | --- |
| `lead_id` | equals | `{{$node["Normalize Trial Request"].json.lead_id}}` |

Open `Settings` and turn on:

```text
Always Output Data
```

### Node 4: Was Lead Found?

Add:

```text
IF
```

Rename:

```text
Was Lead Found?
```

Condition:

| Field | Value |
| --- | --- |
| Value 1 | `{{$json.lead_id}}` |
| Operation | `is not empty` |

### Node 5F: Prepare Booking Lead Not Found Log

Use this on the `false` branch.

Add:

```text
Code
```

Rename:

```text
Prepare Booking Lead Not Found Log
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const request = $node["Normalize Trial Request"].json;
const now = new Date().toISOString();

return [
  {
    json: {
      log: {
        log_id: makeId("log"),
        workflow_name: request.workflow_name,
        trigger_event: request.event_type,
        entity_type: "lead",
        entity_id: request.lead_id,
        action_taken: "Trial booking requested but lead was not found",
        status: "failed",
        error_message: `No lead found for lead_id ${request.lead_id}`,
        created_at: now,
      },
      response: {
        ok: false,
        status: "lead_not_found",
        lead_id: request.lead_id,
      },
    },
  },
];
```

### Node 6F: Log Booking Lead Not Found

Add:

```text
Google Sheets
```

Rename:

```text
Log Booking Lead Not Found
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Automation Logs` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$json.log.log_id}}` |
| `workflow_name` | `{{$json.log.workflow_name}}` |
| `trigger_event` | `{{$json.log.trigger_event}}` |
| `entity_type` | `{{$json.log.entity_type}}` |
| `entity_id` | `{{$json.log.entity_id}}` |
| `action_taken` | `{{$json.log.action_taken}}` |
| `status` | `{{$json.log.status}}` |
| `error_message` | `{{$json.log.error_message}}` |
| `created_at` | `{{$json.log.created_at}}` |

### Node 7F: Respond Booking Lead Not Found

Add:

```text
Respond to Webhook
```

Rename:

```text
Respond Booking Lead Not Found
```

Settings:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `404` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Booking Lead Not Found Log"].json.response) }}` |

### Node 5: Can Send Booking Options?

Use this on the `true` branch of `Was Lead Found?`.

Add:

```text
IF
```

Rename:

```text
Can Send Booking Options?
```

Use three conditions with `AND`:

| Value 1 | Operation | Value 2 |
| --- | --- | --- |
| `{{$json.consent_status}}` | equals | `yes` |
| `{{$json.opted_out}}` | not equals | `TRUE` |
| `{{$json.email}}` | is not empty | |

If your `opted_out` value appears as `false` instead of `FALSE`, use this expression instead:

```text
{{String($json.opted_out).toUpperCase()}}
```

and compare it to:

```text
TRUE
```

### Node 6A: Prepare Booking Options Email

Use this on the `true` branch.

Add:

```text
Code
```

Rename:

```text
Prepare Booking Options Email
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const lead = $input.first().json;
const now = new Date().toISOString();

const slots = [
  "Mardi a 18h30",
  "Mercredi a 12h30",
  "Jeudi a 19h00"
];

const body = `
Bonjour ${lead.name},

Merci pour votre interet. Voici quelques creneaux possibles pour votre seance d'essai chez Elite Club:

- ${slots[0]}
- ${slots[1]}
- ${slots[2]}

Repondez simplement a cet email avec le creneau qui vous convient le mieux.

Sportivement,
L'equipe Elite Club
`.trim();

return [
  {
    json: {
      ...lead,
      email: {
        to: lead.email,
        subject: "Choisissez votre seance d'essai chez Elite Club",
        body,
      },
      updated_lead: {
        ...lead,
        lifecycle_stage: "trial_options_sent",
        last_contacted_at: now,
        updated_at: now,
      },
      interaction: {
        interaction_id: makeId("int"),
        person_type: "lead",
        person_id: lead.lead_id,
        channel: "email",
        direction: "outbound",
        message: body,
        ai_generated: "FALSE",
        sent_status: "sent",
        created_at: now,
      },
      log: {
        log_id: makeId("log"),
        workflow_name: "02 - Booking and Trial Follow-Up",
        trigger_event: "trial.requested",
        entity_type: "lead",
        entity_id: lead.lead_id,
        action_taken: "Booking options email sent",
        status: "success",
        error_message: "",
        created_at: now,
      },
      response: {
        ok: true,
        status: "booking_options_sent",
        lead_id: lead.lead_id,
      },
    },
  },
];
```

### Node 7A: Send Booking Options Email

Add:

```text
Gmail
```

Rename:

```text
Send Booking Options Email
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Elite Club Gmail` |
| Resource | `Message` |
| Operation | `Send` |
| To | `{{$json.email.to}}` |
| Subject | `{{$json.email.subject}}` |
| Email Type | `Text` |
| Message | `{{$json.email.body}}` |

### Node 8A: Update Lead to Trial Options Sent

Add:

```text
Google Sheets
```

Rename:

```text
Update Lead to Trial Options Sent
```

Use:

| Setting | Value |
| --- | --- |
| Operation | `Append or Update Row` |
| Sheet | `Leads` |
| Matching Column | `lead_id` |

Map all lead columns from:

```text
{{$node["Prepare Booking Options Email"].json.updated_lead.column_name}}
```

At minimum map:

| Column | Expression |
| --- | --- |
| `lead_id` | `{{$node["Prepare Booking Options Email"].json.updated_lead.lead_id}}` |
| `name` | `{{$node["Prepare Booking Options Email"].json.updated_lead.name}}` |
| `email` | `{{$node["Prepare Booking Options Email"].json.updated_lead.email}}` |
| `phone` | `{{$node["Prepare Booking Options Email"].json.updated_lead.phone}}` |
| `lifecycle_stage` | `{{$node["Prepare Booking Options Email"].json.updated_lead.lifecycle_stage}}` |
| `last_contacted_at` | `{{$node["Prepare Booking Options Email"].json.updated_lead.last_contacted_at}}` |
| `updated_at` | `{{$node["Prepare Booking Options Email"].json.updated_lead.updated_at}}` |

### Node 9A: Log Booking Email Interaction

Add:

```text
Google Sheets
```

Rename:

```text
Log Booking Email Interaction
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Interactions` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `interaction_id` | `{{$node["Prepare Booking Options Email"].json.interaction.interaction_id}}` |
| `person_type` | `{{$node["Prepare Booking Options Email"].json.interaction.person_type}}` |
| `person_id` | `{{$node["Prepare Booking Options Email"].json.interaction.person_id}}` |
| `channel` | `{{$node["Prepare Booking Options Email"].json.interaction.channel}}` |
| `direction` | `{{$node["Prepare Booking Options Email"].json.interaction.direction}}` |
| `message` | `{{$node["Prepare Booking Options Email"].json.interaction.message}}` |
| `ai_generated` | `{{$node["Prepare Booking Options Email"].json.interaction.ai_generated}}` |
| `sent_status` | `{{$node["Prepare Booking Options Email"].json.interaction.sent_status}}` |
| `created_at` | `{{$node["Prepare Booking Options Email"].json.interaction.created_at}}` |

### Node 10A: Log Booking Email Automation

Add:

```text
Google Sheets
```

Rename:

```text
Log Booking Email Automation
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Automation Logs` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Booking Options Email"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Booking Options Email"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Booking Options Email"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Booking Options Email"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Booking Options Email"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Booking Options Email"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Booking Options Email"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Booking Options Email"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Booking Options Email"].json.log.created_at}}` |

### Node 11A: Respond Booking Options Sent

Add `Respond to Webhook`.

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Booking Options Email"].json.response) }}` |

### Node 6B: Prepare Booking Manual Task

Use this on the `false` branch of `Can Send Booking Options?`.

Add:

```text
Code
```

Rename:

```text
Prepare Booking Manual Task
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const lead = $input.first().json;
const now = new Date().toISOString();

let reason = "Cannot send booking options automatically";
if (String(lead.consent_status).toLowerCase() !== "yes") {
  reason = "Consent is not yes";
}
if (String(lead.opted_out).toUpperCase() === "TRUE") {
  reason = "Lead is opted out";
}
if (!lead.email) {
  reason = "Lead has no email";
}

return [
  {
    json: {
      task: {
        task_id: makeId("task"),
        owner: "Gym Owner",
        entity_type: "lead",
        entity_id: lead.lead_id,
        task_type: "booking",
        priority: "high",
        due_at: now,
        status: "open",
        notes: `Trial requested but automatic booking email was not sent. Reason: ${reason}. Contact ${lead.name} manually.`,
        created_at: now,
      },
      log: {
        log_id: makeId("log"),
        workflow_name: "02 - Booking and Trial Follow-Up",
        trigger_event: "trial.requested",
        entity_type: "lead",
        entity_id: lead.lead_id,
        action_taken: `Booking options queued for manual follow-up: ${reason}`,
        status: "queued",
        error_message: "",
        created_at: now,
      },
      response: {
        ok: true,
        status: "booking_manual_task_created",
        lead_id: lead.lead_id,
        reason,
      },
    },
  },
];
```

### Node 7B: Add Booking Manual Task

Add:

```text
Google Sheets
```

Rename:

```text
Add Booking Manual Task
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Tasks` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `task_id` | `{{$node["Prepare Booking Manual Task"].json.task.task_id}}` |
| `owner` | `{{$node["Prepare Booking Manual Task"].json.task.owner}}` |
| `entity_type` | `{{$node["Prepare Booking Manual Task"].json.task.entity_type}}` |
| `entity_id` | `{{$node["Prepare Booking Manual Task"].json.task.entity_id}}` |
| `task_type` | `{{$node["Prepare Booking Manual Task"].json.task.task_type}}` |
| `priority` | `{{$node["Prepare Booking Manual Task"].json.task.priority}}` |
| `due_at` | `{{$node["Prepare Booking Manual Task"].json.task.due_at}}` |
| `status` | `{{$node["Prepare Booking Manual Task"].json.task.status}}` |
| `notes` | `{{$node["Prepare Booking Manual Task"].json.task.notes}}` |
| `created_at` | `{{$node["Prepare Booking Manual Task"].json.task.created_at}}` |

### Node 8B: Log Booking Queued Automation

Add:

```text
Google Sheets
```

Rename:

```text
Log Booking Queued Automation
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Automation Logs` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Booking Manual Task"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Booking Manual Task"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Booking Manual Task"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Booking Manual Task"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Booking Manual Task"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Booking Manual Task"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Booking Manual Task"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Booking Manual Task"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Booking Manual Task"].json.log.created_at}}` |

### Node 9B: Respond Booking Queued

Add:

```text
Respond to Webhook
```

Rename:

```text
Respond Booking Queued
```

Settings:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Booking Manual Task"].json.response) }}` |

## 14B. Route B - Trial Slot Selected - Create Booking

### What This Route Does

This route receives the exact slot selected by the lead or staff, creates a Google Calendar event, sends confirmation, updates the lead stage, and logs everything.

### Node Map

```text
Trial Slot Selected Webhook
  -> Normalize Trial Slot
  -> Get Lead for Trial Slot
  -> Was Trial Lead Found?
  -> Create Trial Calendar Event
  -> Prepare Trial Confirmation Email
  -> Send Trial Confirmation Email
  -> Update Lead to Trial Booked
  -> Log Trial Booking Interaction
  -> Log Trial Booking Automation
  -> Respond Trial Booked
```

### Node 1: Trial Slot Selected Webhook

Add `Webhook`.

Rename:

```text
Trial Slot Selected Webhook
```

Settings:

| Setting | Value |
| --- | --- |
| HTTP Method | `POST` |
| Path | `trial-slot-selected` |
| Respond | `Using Respond to Webhook Node` |

Test payload:

```json
{
  "lead_id": "lead_001",
  "trial_start": "2026-05-28T18:30:00+02:00",
  "trial_end": "2026-05-28T19:15:00+02:00"
}
```

### Node 2: Normalize Trial Slot

Add `Code`.

Rename:

```text
Normalize Trial Slot
```

Paste:

```js
const webhookOutput = $input.first().json || {};
const input = webhookOutput.body || webhookOutput;

const leadId = String(input.lead_id || "").trim();
const trialStart = String(input.trial_start || "").trim();
const trialEnd = String(input.trial_end || "").trim();
const errors = [];

if (!leadId) errors.push("lead_id is required");
if (!trialStart) errors.push("trial_start is required");
if (!trialEnd) errors.push("trial_end is required");

return [
  {
    json: {
      workflow_name: "02 - Booking and Trial Follow-Up",
      event_type: "trial.slot_selected",
      lead_id: leadId,
      trial_start: trialStart,
      trial_end: trialEnd,
      valid: errors.length === 0,
      validation_errors: errors,
      now: new Date().toISOString(),
    },
  },
];
```

### Node 3: Get Lead for Trial Slot

Add `Google Sheets`.

Rename:

```text
Get Lead for Trial Slot
```

Operation:

```text
Get Row(s)
```

Sheet:

```text
Leads
```

Filter:

| Column | Operation | Value |
| --- | --- | --- |
| `lead_id` | equals | `{{$node["Normalize Trial Slot"].json.lead_id}}` |

Limit:

```text
1
```

Turn on `Always Output Data`.

### Node 4: Was Trial Lead Found?

Add `IF`.

Rename:

```text
Was Trial Lead Found?
```

Condition:

```text
{{$json.lead_id}} is not empty
```

Use the `true` output for calendar booking. Use the `false` output for the not-found branch below.

### Node 5F: Prepare Trial Slot Lead Not Found Log

Add this from the `false` output of `Was Trial Lead Found?`.

Add:

```text
Code
```

Rename:

```text
Prepare Trial Slot Lead Not Found Log
```

Important Route B reference:

This node must read from:

```text
Normalize Trial Slot
```

It must **not** read from:

```text
Normalize Trial Request
```

`Normalize Trial Request` belongs to Route A. When you test Route B, Route A has not executed, so any expression or Code node line that references `Normalize Trial Request` will fail with `Node 'Normalize Trial Request' hasn't been executed`.

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const request = $node["Normalize Trial Slot"].json;
const now = new Date().toISOString();

return [
  {
    json: {
      log: {
        log_id: makeId("log"),
        workflow_name: request.workflow_name,
        trigger_event: request.event_type,
        entity_type: "lead",
        entity_id: request.lead_id,
        action_taken: "Trial slot selected but lead was not found",
        status: "failed",
        error_message: `No lead found for lead_id ${request.lead_id}`,
        created_at: now,
      },
      response: {
        ok: false,
        status: "lead_not_found",
        lead_id: request.lead_id,
      },
    },
  },
];
```

### Node 6F: Log Trial Slot Lead Not Found

Add:

```text
Google Sheets
```

Rename:

```text
Log Trial Slot Lead Not Found
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Automation Logs` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$json.log.log_id}}` |
| `workflow_name` | `{{$json.log.workflow_name}}` |
| `trigger_event` | `{{$json.log.trigger_event}}` |
| `entity_type` | `{{$json.log.entity_type}}` |
| `entity_id` | `{{$json.log.entity_id}}` |
| `action_taken` | `{{$json.log.action_taken}}` |
| `status` | `{{$json.log.status}}` |
| `error_message` | `{{$json.log.error_message}}` |
| `created_at` | `{{$json.log.created_at}}` |

### Node 7F: Respond Trial Slot Lead Not Found

Add:

```text
Respond to Webhook
```

Rename:

```text
Respond Trial Slot Lead Not Found
```

Settings:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `404` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Trial Slot Lead Not Found Log"].json.response) }}` |

### Node 5: Create Trial Calendar Event

Add:

```text
Google Calendar
```

Rename:

```text
Create Trial Calendar Event
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Elite Club Google Calendar` |
| Resource | `Event` |
| Operation | `Create` |
| Calendar | your real booking calendar, for example `Elite Club Trial Bookings` |
| Start Time | `{{ new Date($node["Normalize Trial Slot"].json.trial_start).toISOString() }}` |
| End Time | `{{ new Date($node["Normalize Trial Slot"].json.trial_end).toISOString() }}` |
| Summary | `Trial session - {{$node["Get Lead for Trial Slot"].json.name}}` |

For the first successful test, do **not** add Attendees, Description, Location, or custom reminders yet. Create the simplest possible calendar event first.

Important calendar selection rule:

The `Calendar` field must be an actual Google Calendar, not your Google Sheet or CRM document. If you see something like:

```text
Gym Sales Automation OS - CRM
```

in the Calendar field, only use it if you intentionally created a Google Calendar with that exact name. The recommended professional setup is to create a dedicated calendar in Google Calendar named:

```text
Elite Club Trial Bookings
```

Then select that calendar in this node.

If `Gym Sales Automation OS - CRM` is intentionally your real Google Calendar name, you can keep using it. In that case, the next likely cause of `400 Bad Request` is not the calendar selection; it is usually one of the optional event fields, especially `Attendees`.

Recommended first-test setup:

| Field | Value |
| --- | --- |
| Calendar | `Elite Club Trial Bookings` or your main calendar |
| Start Time | `{{ new Date($node["Normalize Trial Slot"].json.trial_start).toISOString() }}` |
| End Time | `{{ new Date($node["Normalize Trial Slot"].json.trial_end).toISOString() }}` |
| Summary | `Trial session - {{$node["Get Lead for Trial Slot"].json.name}}` |
| Use Default Reminders | `Off` for the first test |
| Attendees | leave empty for the first test |
| Description | leave empty for the first test |
| Location | leave empty for the first test |

After the simple event works, add these optional fields.

Description:

```text
{{ "Phone: " + ($node["Get Lead for Trial Slot"].json.phone || "") + "\nGoal: " + ($node["Get Lead for Trial Slot"].json.fitness_goal || "") + "\nService: " + ($node["Get Lead for Trial Slot"].json.interested_service || "") }}
```

Location:

```text
Your gym address
```

Attendees:

```text
{{$node["Get Lead for Trial Slot"].json.email}}
```

If adding Attendees brings the `400 Bad Request` error back, remove Attendees and keep the booking confirmation by Gmail only. For the MVP, the calendar event is mainly for the gym owner/staff calendar; the lead already receives the confirmation email in the next node.

Common causes of `400 Bad Request` in this node:

| Cause | Fix |
| --- | --- |
| Wrong calendar selected | Select a real Google Calendar, preferably `Elite Club Trial Bookings` |
| Start/end values are not valid dates | Use the `new Date(...).toISOString()` expressions above |
| End time is before or equal to start time | Send a later `trial_end` value |
| Attendee field is rejected | Remove Attendees for the first test, especially if the lead email is demo data like `marc@example.com` |
| Extra fields contain unsupported values | Start with only Calendar, Start, End, and Summary |

Professional debugging order:

1. Remove `Attendees`.
2. Remove `Description`.
3. Remove `Location`.
4. Turn `Use Default Reminders` off.
5. Execute the node with only Calendar, Start Time, End Time, and Summary.
6. If it works, add Description back.
7. If it still works, add Location back.
8. Add Attendees last, using a real email address you control for testing.

If the event works without Attendees but fails when Attendees is added, keep Attendees empty in the MVP. The next Gmail node already sends the confirmation to the lead, so the Calendar event only needs to exist on the gym's calendar.

### Alternative Node 5: Create Trial Calendar Event with HTTP Request

Use this alternative if the `Google Calendar` node keeps returning `400 Bad Request`.

The URL must be a **Google Calendar API URL**, not a Google Calendar browser/embed URL.

Do **not** use this:

```text
https://calendar.google.com/calendar/embed?src=...
```

That is a web page URL. n8n will receive Google's login/calendar HTML page instead of calling the API.

Use this API format:

```text
https://www.googleapis.com/calendar/v3/calendars/CALENDAR_ID/events
```

Where to get `CALENDAR_ID`:

1. Open Google Calendar in the browser.
2. In the left sidebar, find your calendar, for example `Gym Sales Automation OS - CRM`.
3. Hover over the calendar name.
4. Click the three dots.
5. Click `Settings and sharing`.
6. Scroll to `Integrate calendar`.
7. Copy `Calendar ID`.

The Calendar ID usually looks like one of these:

```text
yourname@gmail.com
```

or:

```text
d05df6abc123example@group.calendar.google.com
```

If the Calendar ID contains `@`, encode it as `%40` in the URL.

Example:

```text
https://www.googleapis.com/calendar/v3/calendars/d05df6abc123example%40group.calendar.google.com/events
```

Beginner test URL:

Use this first to confirm your credential and body are working:

```text
https://www.googleapis.com/calendar/v3/calendars/primary/events
```

If `primary` works, your credential and request body are okay. Then switch to your real calendar ID.

Production-safe HTTP Request setup:

Do not build the HTTP Request JSON body by placing expressions inside quoted JSON strings like this:

```json
{
  "summary": "Seance d'essai - {{$node['Get Lead for Trial Slot'].json.name}}"
}
```

That can work in a manual test, but it can fail in production if a Google Sheets value contains a hidden line break, quote, or other control character. For example, if the lead name is stored as `Marc Dubois\n`, n8n injects that raw line break into the JSON editor and the node fails with:

```text
The value in the "JSON Body" field is not valid JSON
Bad control character in string literal
```

Use the two-node setup below instead.

### Alternative Node 5A: Prepare Calendar Event Payload

Add this Code node before the HTTP Request node.

Rename:

```text
Prepare Calendar Event Payload
```

Paste:

```js
function cleanText(value) {
  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function requireValidDate(value, fieldName) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} is not a valid date: ${value}`);
  }
  return date.toISOString();
}

const lead = $node["Get Lead for Trial Slot"].json;
const slot = $node["Normalize Trial Slot"].json;

const startDateTime = requireValidDate(slot.trial_start, "trial_start");
const endDateTime = requireValidDate(slot.trial_end, "trial_end");

if (new Date(endDateTime) <= new Date(startDateTime)) {
  throw new Error("trial_end must be later than trial_start");
}

return [
  {
    json: {
      calendar_event_body: {
        summary: `Seance d'essai - ${cleanText(lead.name)}`,
        description: [
          `Phone: ${cleanText(lead.phone)}`,
          `Goal: ${cleanText(lead.fitness_goal)}`,
          `Service: ${cleanText(lead.interested_service)}`,
        ].join("\n"),
        start: {
          dateTime: startDateTime,
        },
        end: {
          dateTime: endDateTime,
        },
      },
    },
  },
];
```

### Alternative Node 5B: Create Trial Calendar Event

Add `HTTP Request`.

Rename:

```text
Create Trial Calendar Event
```

HTTP Request node settings:

| Setting | Value |
| --- | --- |
| Method | `POST` |
| URL | `https://www.googleapis.com/calendar/v3/calendars/YOUR_ENCODED_CALENDAR_ID/events` |
| Authentication | `Predefined Credential Type` |
| Credential Type | `Google Calendar OAuth2 API` |
| Google Calendar OAuth2 API | `Google Calendar account` |
| Send Body | `On` |
| Body Content Type | `JSON` |
| Specify Body | `Using JSON` |

For the `JSON` field, click `fx` / `Expression` and paste this as the entire field:

```text
{{ JSON.stringify($node["Prepare Calendar Event Payload"].json.calendar_event_body) }}
```

Do not add attendees in this HTTP Request version until the basic event creation works.

### Node 6: Prepare Trial Confirmation Email

Add `Code`.

Rename:

```text
Prepare Trial Confirmation Email
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const lead = $node["Get Lead for Trial Slot"].json;
const slot = $node["Normalize Trial Slot"].json;
const calendarEvent = $node["Create Trial Calendar Event"].json || {};
const now = new Date().toISOString();

const body = `
Bonjour ${lead.name},

Votre seance d'essai chez Elite Club est confirmee.

Date et heure:
${slot.trial_start}

Pensez a venir avec une tenue de sport, une serviette et une bouteille d'eau.

A tres vite,
L'equipe Elite Club
`.trim();

return [
  {
    json: {
      ...lead,
      trial_start: slot.trial_start,
      trial_end: slot.trial_end,
      calendar_event_id: calendarEvent.id || "",
      email: {
        to: lead.email,
        subject: "Confirmation de votre seance d'essai",
        body,
      },
      updated_lead: {
        ...lead,
        lifecycle_stage: "trial_booked",
        last_contacted_at: now,
        updated_at: now,
      },
      interaction: {
        interaction_id: makeId("int"),
        person_type: "lead",
        person_id: lead.lead_id,
        channel: "email",
        direction: "outbound",
        message: body,
        ai_generated: "FALSE",
        sent_status: "sent",
        created_at: now,
      },
      log: {
        log_id: makeId("log"),
        workflow_name: "02 - Booking and Trial Follow-Up",
        trigger_event: "trial.slot_selected",
        entity_type: "lead",
        entity_id: lead.lead_id,
        action_taken: "Trial booked, calendar event created, confirmation sent",
        status: "success",
        error_message: "",
        created_at: now,
      },
      response: {
        ok: true,
        status: "trial_booked",
        lead_id: lead.lead_id,
        calendar_event_id: calendarEvent.id || "",
      },
    },
  },
];
```

### Node 7: Send Trial Confirmation Email

Add:

```text
Gmail
```

Rename:

```text
Send Trial Confirmation Email
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Elite Club Gmail` |
| Resource | `Message` |
| Operation | `Send` |
| To | `{{$node["Prepare Trial Confirmation Email"].json.email.to}}` |
| Subject | `{{$node["Prepare Trial Confirmation Email"].json.email.subject}}` |
| Email Type | `Text` |
| Message | `{{$node["Prepare Trial Confirmation Email"].json.email.body}}` |

### Node 8: Update Lead to Trial Booked

Add:

```text
Google Sheets
```

Rename:

```text
Update Lead to Trial Booked
```

Important Route B mapping rule:

Every expression in this node must reference:

```text
Prepare Trial Confirmation Email
```

Do **not** reference:

```text
Prepare Booking Options Email
```

`Prepare Booking Options Email` belongs to Route A. When Route B runs, Route A has not executed, so n8n will throw `Node 'Prepare Booking Options Email' hasn't been executed`.

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Leads` |
| Matching Column | `lead_id` |
| Mapping Mode | Map each column manually |

Map at minimum:

| Column | Expression |
| --- | --- |
| `lead_id` | `{{$node["Prepare Trial Confirmation Email"].json.updated_lead.lead_id}}` |
| `name` | `{{$node["Prepare Trial Confirmation Email"].json.updated_lead.name}}` |
| `email` | `{{$node["Prepare Trial Confirmation Email"].json.updated_lead.email}}` |
| `phone` | `{{$node["Prepare Trial Confirmation Email"].json.updated_lead.phone}}` |
| `lifecycle_stage` | `{{$node["Prepare Trial Confirmation Email"].json.updated_lead.lifecycle_stage}}` |
| `last_contacted_at` | `{{$node["Prepare Trial Confirmation Email"].json.updated_lead.last_contacted_at}}` |
| `updated_at` | `{{$node["Prepare Trial Confirmation Email"].json.updated_lead.updated_at}}` |
| `trial_start` | `{{$node["Prepare Trial Confirmation Email"].json.trial_start}}` |
| `trial_end` | `{{$node["Prepare Trial Confirmation Email"].json.trial_end}}` |
| `calendar_event_id` | `{{$node["Prepare Trial Confirmation Email"].json.calendar_event_id}}` |

If your `Leads` sheet does not yet have `trial_start`, `trial_end`, or `calendar_event_id`, add those columns before mapping them.

### Node 9: Log Trial Booking Interaction

Add:

```text
Google Sheets
```

Rename:

```text
Log Trial Booking Interaction
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Interactions` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `interaction_id` | `{{$node["Prepare Trial Confirmation Email"].json.interaction.interaction_id}}` |
| `person_type` | `{{$node["Prepare Trial Confirmation Email"].json.interaction.person_type}}` |
| `person_id` | `{{$node["Prepare Trial Confirmation Email"].json.interaction.person_id}}` |
| `channel` | `{{$node["Prepare Trial Confirmation Email"].json.interaction.channel}}` |
| `direction` | `{{$node["Prepare Trial Confirmation Email"].json.interaction.direction}}` |
| `message` | `{{$node["Prepare Trial Confirmation Email"].json.interaction.message}}` |
| `ai_generated` | `{{$node["Prepare Trial Confirmation Email"].json.interaction.ai_generated}}` |
| `sent_status` | `{{$node["Prepare Trial Confirmation Email"].json.interaction.sent_status}}` |
| `created_at` | `{{$node["Prepare Trial Confirmation Email"].json.interaction.created_at}}` |

### Node 10: Log Trial Booking Automation

Add:

```text
Google Sheets
```

Rename:

```text
Log Trial Booking Automation
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Automation Logs` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Trial Confirmation Email"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Trial Confirmation Email"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Trial Confirmation Email"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Trial Confirmation Email"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Trial Confirmation Email"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Trial Confirmation Email"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Trial Confirmation Email"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Trial Confirmation Email"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Trial Confirmation Email"].json.log.created_at}}` |

### Node 11: Respond Trial Booked

Add:

```text
Respond to Webhook
```

Rename:

```text
Respond Trial Booked
```

Settings:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Trial Confirmation Email"].json.response) }}` |

## 14C. Route C - Daily Trial Reminder

### What This Route Does

Every morning, this route checks leads with `lifecycle_stage = trial_booked` and sends reminders for trials happening tomorrow.

This requires a trial date field. The current MVP `Leads` schema does not include it. Add these optional columns to the `Leads` tab:

```text
trial_start
trial_end
trial_reminder_sent_at
```

### Node Map

```text
Daily Trial Reminder Schedule
  -> Get Trial Booked Leads
  -> Filter Trials Tomorrow
  -> Can Send Trial Reminder?

Can Send Trial Reminder? true
  -> Prepare Trial Reminder Email
  -> Send Trial Reminder Email
  -> Mark Trial Reminder Sent
  -> Log Trial Reminder Interaction
  -> Log Trial Reminder Automation

Can Send Trial Reminder? false
  -> Prepare Skipped Trial Reminder
  -> Log Skipped Trial Reminder Interaction
  -> Log Skipped Trial Reminder Automation
  -> Needs Manual Trial Reminder Task?

Needs Manual Trial Reminder Task? true
  -> Add Manual Trial Reminder Task
```

### Node 1: Daily Trial Reminder Schedule

Add:

```text
Schedule Trigger
```

Rename:

```text
Daily Trial Reminder Schedule
```

Set:

```text
Every day at 08:00
```

### Node 2: Get Trial Booked Leads

Add:

```text
Google Sheets
```

Rename:

```text
Get Trial Booked Leads
```

Operation:

```text
Get Row(s)
```

Sheet:

```text
Leads
```

Filter:

| Column | Operation | Value |
| --- | --- | --- |
| `lifecycle_stage` | equals | `trial_booked` |

Return All:

```text
On
```

### Node 3: Filter Trials Tomorrow

Add:

```text
Code
```

Rename:

```text
Filter Trials Tomorrow
```

Mode:

```text
Run Once for All Items
```

Paste:

```js
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const now = new Date();
const tomorrow = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
const dayAfterTomorrow = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2));

const output = [];

for (const item of $input.all()) {
  const lead = item.json;
  const trialStart = new Date(lead.trial_start || "");
  const alreadySent = Boolean(lead.trial_reminder_sent_at);

  if (!Number.isNaN(trialStart.getTime()) && trialStart >= tomorrow && trialStart < dayAfterTomorrow && !alreadySent) {
    output.push({ json: lead });
  }
}

return output;
```

### Node 4: Can Send Trial Reminder?

Add `IF`.

Rename:

```text
Can Send Trial Reminder?
```

Use `AND`:

| Value 1 | Operation | Value 2 |
| --- | --- | --- |
| `{{$json.consent_status}}` | equals | `yes` |
| `{{String($json.opted_out).toUpperCase()}}` | not equals | `TRUE` |
| `{{$json.email}}` | is not empty | |

This IF node has two output paths. Connect them exactly like this:

| IF Output | Meaning | Connect To |
| --- | --- | --- |
| `true` | The lead has consent, is not opted out, and has an email. The reminder can be sent automatically. | `Prepare Trial Reminder Email` |
| `false` | At least one send condition failed. The reminder must not be sent automatically. | `Prepare Skipped Trial Reminder` |

In the n8n canvas, the `true` output is the success/true branch of the IF node. The `false` output is the other branch. Do not leave the `false` branch empty. A skipped reminder is an important compliance/audit event, not a dead end.

The logic is:

```text
IF true:
  prepare email
  send email
  mark reminder sent
  log sent interaction
  log success automation

IF false:
  prepare skipped reason
  log skipped interaction
  log skipped automation
  check whether a manual task is needed
  create manual task only when needed
```

### False Branch: Trial Reminder Cannot Be Sent

Use this branch when `Can Send Trial Reminder?` outputs `false`.

Connect:

```text
Can Send Trial Reminder? false
  -> Prepare Skipped Trial Reminder
  -> Log Skipped Trial Reminder Interaction
  -> Log Skipped Trial Reminder Automation
  -> Needs Manual Trial Reminder Task?
```

If `Needs Manual Trial Reminder Task?` is true:

```text
Needs Manual Trial Reminder Task? true
  -> Add Manual Trial Reminder Task
```

If `Needs Manual Trial Reminder Task?` is false, stop the branch after the skipped logs. That is intentional.

Professional behavior:

| Reason | Action |
| --- | --- |
| `consent_status = no` | Do not send. Log skipped. No task required unless staff explicitly asked for one. |
| `opted_out = TRUE` | Do not send. Log skipped. No task required. |
| `consent_status = unknown` | Do not send. Log skipped. Create a manual task to confirm consent or follow up appropriately. |
| Missing email | Do not send email. Log skipped. Create a manual booking/reminder task if consent allows. |
| Unexpected data issue | Do not send. Log skipped. Create a manual review task. |

### Node 5F: Prepare Skipped Trial Reminder

Add `Code` from the `false` output of `Can Send Trial Reminder?`.

Rename:

```text
Prepare Skipped Trial Reminder
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isTrue(value) {
  if (value === true) return true;
  return String(value ?? "").trim().toUpperCase() === "TRUE";
}

const lead = $input.first().json;
const now = new Date().toISOString();
const consent = String(lead.consent_status || "unknown").toLowerCase();
const optedOut = isTrue(lead.opted_out);
const hasEmail = Boolean(String(lead.email || "").trim());

let skipReason = "Trial reminder could not be sent because the lead failed the send eligibility check.";
let needsManualTask = true;
let taskPriority = "medium";
let taskNotes = `Review trial reminder for ${lead.name || "this lead"}.`;

if (optedOut) {
  skipReason = "Trial reminder skipped because the lead is opted out.";
  needsManualTask = false;
} else if (consent === "no") {
  skipReason = "Trial reminder skipped because consent status is no.";
  needsManualTask = false;
} else if (consent === "unknown") {
  skipReason = "Trial reminder skipped because consent status is unknown.";
  needsManualTask = true;
  taskPriority = "high";
  taskNotes = `Consent is unknown for ${lead.name}. Review before any trial reminder or manual outreach.`;
} else if (!hasEmail) {
  skipReason = "Trial reminder skipped because the lead has no email address.";
  needsManualTask = true;
  taskPriority = "medium";
  taskNotes = `No email is available for ${lead.name}. Manually remind them about the trial if consent allows.`;
}

return [
  {
    json: {
      ...lead,
      skip_reason: skipReason,
      needs_manual_task: needsManualTask,
      skipped_interaction: {
        interaction_id: makeId("int"),
        person_type: "lead",
        person_id: lead.lead_id,
        channel: hasEmail ? "email" : "manual",
        direction: "internal",
        message: skipReason,
        ai_generated: "FALSE",
        sent_status: "skipped",
        created_at: now,
      },
      skipped_log: {
        log_id: makeId("log"),
        workflow_name: "02 - Booking and Trial Follow-Up",
        trigger_event: "daily_trial_reminder",
        entity_type: "lead",
        entity_id: lead.lead_id,
        action_taken: skipReason,
        status: "skipped",
        error_message: "",
        created_at: now,
      },
      manual_task: {
        task_id: makeId("task"),
        owner: "Gym Owner",
        entity_type: "lead",
        entity_id: lead.lead_id,
        task_type: "booking",
        priority: taskPriority,
        due_at: now,
        status: "open",
        notes: taskNotes,
        created_at: now,
      },
    },
  },
];
```

### Node 6F: Log Skipped Trial Reminder Interaction

Add `Google Sheets`.

Rename:

```text
Log Skipped Trial Reminder Interaction
```

Set:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Interactions` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `interaction_id` | `{{$json.skipped_interaction.interaction_id}}` |
| `person_type` | `{{$json.skipped_interaction.person_type}}` |
| `person_id` | `{{$json.skipped_interaction.person_id}}` |
| `channel` | `{{$json.skipped_interaction.channel}}` |
| `direction` | `{{$json.skipped_interaction.direction}}` |
| `message` | `{{$json.skipped_interaction.message}}` |
| `ai_generated` | `{{$json.skipped_interaction.ai_generated}}` |
| `sent_status` | `{{$json.skipped_interaction.sent_status}}` |
| `created_at` | `{{$json.skipped_interaction.created_at}}` |

### Node 7F: Log Skipped Trial Reminder Automation

Add `Google Sheets`.

Rename:

```text
Log Skipped Trial Reminder Automation
```

Set:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Automation Logs` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$json.skipped_log.log_id}}` |
| `workflow_name` | `{{$json.skipped_log.workflow_name}}` |
| `trigger_event` | `{{$json.skipped_log.trigger_event}}` |
| `entity_type` | `{{$json.skipped_log.entity_type}}` |
| `entity_id` | `{{$json.skipped_log.entity_id}}` |
| `action_taken` | `{{$json.skipped_log.action_taken}}` |
| `status` | `{{$json.skipped_log.status}}` |
| `error_message` | `{{$json.skipped_log.error_message}}` |
| `created_at` | `{{$json.skipped_log.created_at}}` |

### Node 8F: Needs Manual Trial Reminder Task?

Add `IF`.

Rename:

```text
Needs Manual Trial Reminder Task?
```

Condition:

| Value 1 | Operation |
| --- | --- |
| `{{$json.needs_manual_task}}` | `is true` |

If `false`, the branch ends after logging. This is correct for opted-out leads and leads with `consent_status = no`.

### Node 9F: Add Manual Trial Reminder Task

Add this node from the `true` output of `Needs Manual Trial Reminder Task?`.

Node:

```text
Google Sheets
```

Rename:

```text
Add Manual Trial Reminder Task
```

Set:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Tasks` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `task_id` | `{{$json.manual_task.task_id}}` |
| `owner` | `{{$json.manual_task.owner}}` |
| `entity_type` | `{{$json.manual_task.entity_type}}` |
| `entity_id` | `{{$json.manual_task.entity_id}}` |
| `task_type` | `{{$json.manual_task.task_type}}` |
| `priority` | `{{$json.manual_task.priority}}` |
| `due_at` | `{{$json.manual_task.due_at}}` |
| `status` | `{{$json.manual_task.status}}` |
| `notes` | `{{$json.manual_task.notes}}` |
| `created_at` | `{{$json.manual_task.created_at}}` |

### True Branch: Trial Reminder Can Be Sent

Use this branch when `Can Send Trial Reminder?` outputs `true`.

Connect:

```text
Can Send Trial Reminder? true
  -> Prepare Trial Reminder Email
  -> Send Trial Reminder Email
  -> Mark Trial Reminder Sent
  -> Log Trial Reminder Interaction
  -> Log Trial Reminder Automation
```

This branch is only for leads who pass all three IF conditions:

```text
consent_status = yes
opted_out is not TRUE
email is not empty
```

### Node 5: Prepare Trial Reminder Email

Add `Code`.

Rename:

```text
Prepare Trial Reminder Email
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const lead = $input.first().json;
const now = new Date().toISOString();

const body = `
Bonjour ${lead.name},

Petit rappel: votre seance d'essai chez Elite Club est prevue demain.

Date et heure:
${lead.trial_start}

Pensez a venir avec une tenue de sport, une serviette et une bouteille d'eau.

A demain,
L'equipe Elite Club
`.trim();

return [
  {
    json: {
      ...lead,
      email: {
        to: lead.email,
        subject: "Rappel de votre seance d'essai",
        body,
      },
      updated_lead: {
        ...lead,
        trial_reminder_sent_at: now,
        updated_at: now,
      },
      interaction: {
        interaction_id: makeId("int"),
        person_type: "lead",
        person_id: lead.lead_id,
        channel: "email",
        direction: "outbound",
        message: body,
        ai_generated: "FALSE",
        sent_status: "sent",
        created_at: now,
      },
      log: {
        log_id: makeId("log"),
        workflow_name: "02 - Booking and Trial Follow-Up",
        trigger_event: "daily_trial_reminder",
        entity_type: "lead",
        entity_id: lead.lead_id,
        action_taken: "Trial reminder sent",
        status: "success",
        error_message: "",
        created_at: now,
      },
    },
  },
];
```

### Node 6: Send Trial Reminder Email

Add:

```text
Gmail
```

Rename:

```text
Send Trial Reminder Email
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Elite Club Gmail` |
| Resource | `Message` |
| Operation | `Send` |
| To | `{{$node["Prepare Trial Reminder Email"].json.email.to}}` |
| Subject | `{{$node["Prepare Trial Reminder Email"].json.email.subject}}` |
| Email Type | `Text` |
| Message | `{{$node["Prepare Trial Reminder Email"].json.email.body}}` |

### Node 7: Mark Trial Reminder Sent

Add:

```text
Google Sheets
```

Rename:

```text
Mark Trial Reminder Sent
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Leads` |
| Matching Column | `lead_id` |
| Mapping Mode | Map each column manually |

Map at minimum:

| Column | Expression |
| --- | --- |
| `lead_id` | `{{$node["Prepare Trial Reminder Email"].json.updated_lead.lead_id}}` |
| `name` | `{{$node["Prepare Trial Reminder Email"].json.updated_lead.name}}` |
| `email` | `{{$node["Prepare Trial Reminder Email"].json.updated_lead.email}}` |
| `phone` | `{{$node["Prepare Trial Reminder Email"].json.updated_lead.phone}}` |
| `lifecycle_stage` | `{{$node["Prepare Trial Reminder Email"].json.updated_lead.lifecycle_stage}}` |
| `trial_start` | `{{$node["Prepare Trial Reminder Email"].json.updated_lead.trial_start}}` |
| `trial_end` | `{{$node["Prepare Trial Reminder Email"].json.updated_lead.trial_end}}` |
| `trial_reminder_sent_at` | `{{$node["Prepare Trial Reminder Email"].json.updated_lead.trial_reminder_sent_at}}` |
| `updated_at` | `{{$node["Prepare Trial Reminder Email"].json.updated_lead.updated_at}}` |

### Node 8: Log Trial Reminder Interaction

Add:

```text
Google Sheets
```

Rename:

```text
Log Trial Reminder Interaction
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Interactions` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `interaction_id` | `{{$node["Prepare Trial Reminder Email"].json.interaction.interaction_id}}` |
| `person_type` | `{{$node["Prepare Trial Reminder Email"].json.interaction.person_type}}` |
| `person_id` | `{{$node["Prepare Trial Reminder Email"].json.interaction.person_id}}` |
| `channel` | `{{$node["Prepare Trial Reminder Email"].json.interaction.channel}}` |
| `direction` | `{{$node["Prepare Trial Reminder Email"].json.interaction.direction}}` |
| `message` | `{{$node["Prepare Trial Reminder Email"].json.interaction.message}}` |
| `ai_generated` | `{{$node["Prepare Trial Reminder Email"].json.interaction.ai_generated}}` |
| `sent_status` | `{{$node["Prepare Trial Reminder Email"].json.interaction.sent_status}}` |
| `created_at` | `{{$node["Prepare Trial Reminder Email"].json.interaction.created_at}}` |

### Node 9: Log Trial Reminder Automation

Add:

```text
Google Sheets
```

Rename:

```text
Log Trial Reminder Automation
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Automation Logs` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Trial Reminder Email"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Trial Reminder Email"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Trial Reminder Email"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Trial Reminder Email"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Trial Reminder Email"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Trial Reminder Email"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Trial Reminder Email"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Trial Reminder Email"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Trial Reminder Email"].json.log.created_at}}` |

## 14D. Route D - Trial Outcome Follow-Up

### What This Route Does

When staff marks the result of a trial, this route handles the next action.

Possible outcomes:

```text
converted
attended_not_converted
no_show
not_interested
```

### Node Map

```text
Trial Outcome Webhook
  -> Normalize Trial Outcome
  -> Get Lead for Trial Outcome
  -> Trial Outcome Switch
  -> Converted branch
  -> Attended Not Converted branch
  -> No Show branch
  -> Not Interested branch
```

### Node 1: Trial Outcome Webhook

Add `Webhook`.

Rename:

```text
Trial Outcome Webhook
```

Settings:

| Setting | Value |
| --- | --- |
| HTTP Method | `POST` |
| Path | `trial-outcome` |
| Respond | `Using Respond to Webhook Node` |

Test payload:

```json
{
  "lead_id": "lead_001",
  "outcome": "attended_not_converted"
}
```

### Node 2: Normalize Trial Outcome

Add `Code`.

Rename:

```text
Normalize Trial Outcome
```

Paste:

```js
const webhookOutput = $input.first().json || {};
const input = webhookOutput.body || webhookOutput;

const allowed = ["converted", "attended_not_converted", "no_show", "not_interested"];
const outcome = String(input.outcome || "").trim();

return [
  {
    json: {
      workflow_name: "02 - Booking and Trial Follow-Up",
      event_type: "trial.outcome",
      lead_id: String(input.lead_id || "").trim(),
      outcome,
      valid: Boolean(input.lead_id) && allowed.includes(outcome),
      now: new Date().toISOString(),
    },
  },
];
```

### Node 3: Get Lead for Trial Outcome

Use `Google Sheets > Get Row(s)` on `Leads`, filter:

| Column | Operation | Value |
| --- | --- | --- |
| `lead_id` | equals | `{{$json.lead_id}}` |

Limit `1`, and turn on `Always Output Data`.

### Node 4: Trial Outcome Switch

Add:

```text
Switch
```

Rename:

```text
Trial Outcome Switch
```

Rules:

| Output | Condition |
| --- | --- |
| converted | `{{$node["Normalize Trial Outcome"].json.outcome}} equals converted` |
| attended_not_converted | `{{$node["Normalize Trial Outcome"].json.outcome}} equals attended_not_converted` |
| no_show | `{{$node["Normalize Trial Outcome"].json.outcome}} equals no_show` |
| not_interested | `{{$node["Normalize Trial Outcome"].json.outcome}} equals not_interested` |

### Branch: converted

Add a `Code` node named:

```text
Prepare Converted Lead Update
```

Paste:

```js
const lead = $input.first().json;
const now = new Date().toISOString();

return [{
  json: {
    ...lead,
    updated_lead: {
      ...lead,
      lifecycle_stage: "member",
      updated_at: now,
    },
    response: {
      ok: true,
      status: "lead_converted_to_member",
      lead_id: lead.lead_id,
      next_workflow: "03 - Member Lifecycle and Retention"
    }
  }
}];
```

### Converted Node A2: Update Lead Converted

Add:

```text
Google Sheets
```

Rename:

```text
Update Lead Converted
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Leads` |
| Matching Column | `lead_id` |
| Mapping Mode | Map each column manually |

Map at minimum:

| Column | Expression |
| --- | --- |
| `lead_id` | `{{$node["Prepare Converted Lead Update"].json.updated_lead.lead_id}}` |
| `name` | `{{$node["Prepare Converted Lead Update"].json.updated_lead.name}}` |
| `email` | `{{$node["Prepare Converted Lead Update"].json.updated_lead.email}}` |
| `phone` | `{{$node["Prepare Converted Lead Update"].json.updated_lead.phone}}` |
| `lifecycle_stage` | `{{$node["Prepare Converted Lead Update"].json.updated_lead.lifecycle_stage}}` |
| `updated_at` | `{{$node["Prepare Converted Lead Update"].json.updated_lead.updated_at}}` |

### Converted Node A3: Respond Lead Converted

Add:

```text
Respond to Webhook
```

Rename:

```text
Respond Lead Converted
```

Settings:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Converted Lead Update"].json.response) }}` |

After this, you can trigger the `Resamania Event Webhook` route inside Workflow 03 manually with the mock Resamania `member.created` payload.

### Branch: attended_not_converted

Add a `Code` node named:

```text
Prepare Attended Follow-Up Email
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const lead = $input.first().json;
const now = new Date().toISOString();

const body = `
Bonjour ${lead.name},

Merci d'etre venu(e) chez Elite Club pour votre seance d'essai.

Si vous souhaitez continuer, nous pouvons vous aider a choisir la formule la plus adaptee a votre objectif. Repondez simplement a cet email et nous vous guidons.

Sportivement,
L'equipe Elite Club
`.trim();

return [{
  json: {
    ...lead,
    email: {
      to: lead.email,
      subject: "Suite a votre seance d'essai",
      body,
    },
    updated_lead: {
      ...lead,
      lifecycle_stage: "trial_attended",
      last_contacted_at: now,
      updated_at: now,
    },
    interaction: {
      interaction_id: makeId("int"),
      person_type: "lead",
      person_id: lead.lead_id,
      channel: "email",
      direction: "outbound",
      message: body,
      ai_generated: "FALSE",
      sent_status: "sent",
      created_at: now,
    },
    log: {
      log_id: makeId("log"),
      workflow_name: "02 - Booking and Trial Follow-Up",
      trigger_event: "trial.outcome",
      entity_type: "lead",
      entity_id: lead.lead_id,
      action_taken: "Trial attended follow-up sent",
      status: "success",
      error_message: "",
      created_at: now,
    },
    response: {
      ok: true,
      status: "attended_follow_up_sent",
      lead_id: lead.lead_id,
    }
  }
}];
```

### Attended Node B2: Send Attended Follow-Up Email

Add:

```text
Gmail
```

Rename:

```text
Send Attended Follow-Up Email
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Elite Club Gmail` |
| Resource | `Message` |
| Operation | `Send` |
| To | `{{$node["Prepare Attended Follow-Up Email"].json.email.to}}` |
| Subject | `{{$node["Prepare Attended Follow-Up Email"].json.email.subject}}` |
| Email Type | `Text` |
| Message | `{{$node["Prepare Attended Follow-Up Email"].json.email.body}}` |

### Attended Node B3: Update Lead Trial Attended

Add `Google Sheets`.

Rename:

```text
Update Lead Trial Attended
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Leads` |
| Matching Column | `lead_id` |

Map at minimum:

| Column | Expression |
| --- | --- |
| `lead_id` | `{{$node["Prepare Attended Follow-Up Email"].json.updated_lead.lead_id}}` |
| `name` | `{{$node["Prepare Attended Follow-Up Email"].json.updated_lead.name}}` |
| `email` | `{{$node["Prepare Attended Follow-Up Email"].json.updated_lead.email}}` |
| `phone` | `{{$node["Prepare Attended Follow-Up Email"].json.updated_lead.phone}}` |
| `lifecycle_stage` | `{{$node["Prepare Attended Follow-Up Email"].json.updated_lead.lifecycle_stage}}` |
| `last_contacted_at` | `{{$node["Prepare Attended Follow-Up Email"].json.updated_lead.last_contacted_at}}` |
| `updated_at` | `{{$node["Prepare Attended Follow-Up Email"].json.updated_lead.updated_at}}` |

### Attended Node B4: Log Attended Follow-Up Interaction

Add `Google Sheets`.

Rename:

```text
Log Attended Follow-Up Interaction
```

Append to `Interactions` and map:

| Column | Expression |
| --- | --- |
| `interaction_id` | `{{$node["Prepare Attended Follow-Up Email"].json.interaction.interaction_id}}` |
| `person_type` | `{{$node["Prepare Attended Follow-Up Email"].json.interaction.person_type}}` |
| `person_id` | `{{$node["Prepare Attended Follow-Up Email"].json.interaction.person_id}}` |
| `channel` | `{{$node["Prepare Attended Follow-Up Email"].json.interaction.channel}}` |
| `direction` | `{{$node["Prepare Attended Follow-Up Email"].json.interaction.direction}}` |
| `message` | `{{$node["Prepare Attended Follow-Up Email"].json.interaction.message}}` |
| `ai_generated` | `{{$node["Prepare Attended Follow-Up Email"].json.interaction.ai_generated}}` |
| `sent_status` | `{{$node["Prepare Attended Follow-Up Email"].json.interaction.sent_status}}` |
| `created_at` | `{{$node["Prepare Attended Follow-Up Email"].json.interaction.created_at}}` |

### Attended Node B5: Log Attended Follow-Up Automation

Add `Google Sheets`.

Rename:

```text
Log Attended Follow-Up Automation
```

Append to `Automation Logs` and map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Attended Follow-Up Email"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Attended Follow-Up Email"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Attended Follow-Up Email"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Attended Follow-Up Email"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Attended Follow-Up Email"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Attended Follow-Up Email"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Attended Follow-Up Email"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Attended Follow-Up Email"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Attended Follow-Up Email"].json.log.created_at}}` |

### Attended Node B6: Respond Attended Follow-Up Sent

Add `Respond to Webhook`.

Rename:

```text
Respond Attended Follow-Up Sent
```

Settings:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Attended Follow-Up Email"].json.response) }}` |

### Branch: no_show

Add a `Code` node named:

```text
Prepare No Show Rebooking Email
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const lead = $input.first().json;
const now = new Date().toISOString();

const body = `
Bonjour ${lead.name},

Nous n'avons pas pu vous accueillir pour votre seance d'essai. Aucun souci, cela arrive.

Si vous souhaitez reprogrammer, repondez a cet email avec un moment qui vous arrange.

Sportivement,
L'equipe Elite Club
`.trim();

return [{
  json: {
    ...lead,
    email: {
      to: lead.email,
      subject: "On peut reprogrammer votre seance d'essai",
      body,
    },
    updated_lead: {
      ...lead,
      lifecycle_stage: "trial_no_show",
      last_contacted_at: now,
      updated_at: now,
    },
    interaction: {
      interaction_id: makeId("int"),
      person_type: "lead",
      person_id: lead.lead_id,
      channel: "email",
      direction: "outbound",
      message: body,
      ai_generated: "FALSE",
      sent_status: "sent",
      created_at: now,
    },
    log: {
      log_id: makeId("log"),
      workflow_name: "02 - Booking and Trial Follow-Up",
      trigger_event: "trial.outcome",
      entity_type: "lead",
      entity_id: lead.lead_id,
      action_taken: "No-show rebooking email sent",
      status: "success",
      error_message: "",
      created_at: now,
    },
    response: {
      ok: true,
      status: "no_show_rebooking_sent",
      lead_id: lead.lead_id,
    }
  }
}];
```

### No-Show Node C2: Send No Show Rebooking Email

Add `Gmail`.

Rename:

```text
Send No Show Rebooking Email
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Elite Club Gmail` |
| Resource | `Message` |
| Operation | `Send` |
| To | `{{$node["Prepare No Show Rebooking Email"].json.email.to}}` |
| Subject | `{{$node["Prepare No Show Rebooking Email"].json.email.subject}}` |
| Email Type | `Text` |
| Message | `{{$node["Prepare No Show Rebooking Email"].json.email.body}}` |

### No-Show Node C3: Update Lead No Show

Add `Google Sheets`.

Rename:

```text
Update Lead No Show
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Leads` |
| Matching Column | `lead_id` |

Map at minimum:

| Column | Expression |
| --- | --- |
| `lead_id` | `{{$node["Prepare No Show Rebooking Email"].json.updated_lead.lead_id}}` |
| `name` | `{{$node["Prepare No Show Rebooking Email"].json.updated_lead.name}}` |
| `email` | `{{$node["Prepare No Show Rebooking Email"].json.updated_lead.email}}` |
| `phone` | `{{$node["Prepare No Show Rebooking Email"].json.updated_lead.phone}}` |
| `lifecycle_stage` | `{{$node["Prepare No Show Rebooking Email"].json.updated_lead.lifecycle_stage}}` |
| `last_contacted_at` | `{{$node["Prepare No Show Rebooking Email"].json.updated_lead.last_contacted_at}}` |
| `updated_at` | `{{$node["Prepare No Show Rebooking Email"].json.updated_lead.updated_at}}` |

### No-Show Node C4: Log No Show Interaction

Add `Google Sheets`.

Rename:

```text
Log No Show Interaction
```

Append to `Interactions` and map:

| Column | Expression |
| --- | --- |
| `interaction_id` | `{{$node["Prepare No Show Rebooking Email"].json.interaction.interaction_id}}` |
| `person_type` | `{{$node["Prepare No Show Rebooking Email"].json.interaction.person_type}}` |
| `person_id` | `{{$node["Prepare No Show Rebooking Email"].json.interaction.person_id}}` |
| `channel` | `{{$node["Prepare No Show Rebooking Email"].json.interaction.channel}}` |
| `direction` | `{{$node["Prepare No Show Rebooking Email"].json.interaction.direction}}` |
| `message` | `{{$node["Prepare No Show Rebooking Email"].json.interaction.message}}` |
| `ai_generated` | `{{$node["Prepare No Show Rebooking Email"].json.interaction.ai_generated}}` |
| `sent_status` | `{{$node["Prepare No Show Rebooking Email"].json.interaction.sent_status}}` |
| `created_at` | `{{$node["Prepare No Show Rebooking Email"].json.interaction.created_at}}` |

### No-Show Node C5: Log No Show Automation

Add `Google Sheets`.

Rename:

```text
Log No Show Automation
```

Append to `Automation Logs` and map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare No Show Rebooking Email"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare No Show Rebooking Email"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare No Show Rebooking Email"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare No Show Rebooking Email"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare No Show Rebooking Email"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare No Show Rebooking Email"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare No Show Rebooking Email"].json.log.status}}` |
| `error_message` | `{{$node["Prepare No Show Rebooking Email"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare No Show Rebooking Email"].json.log.created_at}}` |

### No-Show Node C6: Respond No Show Rebooking Sent

Add `Respond to Webhook`.

Rename:

```text
Respond No Show Rebooking Sent
```

Settings:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare No Show Rebooking Email"].json.response) }}` |

### Branch: not_interested

Add a `Code` node named:

```text
Prepare Lost Lead Update
```

Paste:

```js
const lead = $input.first().json;
const now = new Date().toISOString();

return [{
  json: {
    ...lead,
    updated_lead: {
      ...lead,
      lifecycle_stage: "lost",
      updated_at: now,
    },
    response: {
      ok: true,
      status: "lead_marked_lost",
      lead_id: lead.lead_id,
    }
  }
}];
```

### Not Interested Node D2: Update Lead Lost

Add:

```text
Google Sheets
```

Rename:

```text
Update Lead Lost
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Leads` |
| Matching Column | `lead_id` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `lead_id` | `{{$node["Prepare Lost Lead Update"].json.updated_lead.lead_id}}` |
| `name` | `{{$node["Prepare Lost Lead Update"].json.updated_lead.name}}` |
| `email` | `{{$node["Prepare Lost Lead Update"].json.updated_lead.email}}` |
| `phone` | `{{$node["Prepare Lost Lead Update"].json.updated_lead.phone}}` |
| `lifecycle_stage` | `{{$node["Prepare Lost Lead Update"].json.updated_lead.lifecycle_stage}}` |
| `updated_at` | `{{$node["Prepare Lost Lead Update"].json.updated_lead.updated_at}}` |

### Not Interested Node D3: Respond Lead Marked Lost

Add:

```text
Respond to Webhook
```

Rename:

```text
Respond Lead Marked Lost
```

Settings:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Lost Lead Update"].json.response) }}` |

## 15. Workflow 03: Member Lifecycle and Retention

Create exactly one n8n workflow:

```text
03 - Member Lifecycle and Retention
```

Inside that one workflow canvas, build these three route groups:

```text
Route A - Mock Resamania Member Events
Route B - Daily Retention Risk
Route C - Google Review Request
```

Do **not** create separate workflows named `03A`, `03B`, or `03C`. Those are only route labels. The actual workflow name should be `03 - Member Lifecycle and Retention`.

### If You Already Built the Split 03 Version

Use the same migration pattern:

1. Create or open `03 - Member Lifecycle and Retention`.
2. Paste the Resamania event route, daily retention route, and review request route into the same workflow canvas.
3. Keep each route visually separate. Do not connect the route groups together.
4. Keep every node name exactly as shown in this guide.
5. Update the Code nodes so every `workflow_name` value says `03 - Member Lifecycle and Retention`.
6. Test each route with `Listen for test event` while building.
7. When you are ready to switch production traffic, deactivate the old split workflows first.
8. Activate the combined Workflow 03.
9. If the Resamania webhook production URL changes, update `N8N_RESAMANIA_WEBHOOK_URL` in Cloudflare Worker secrets.

If n8n refuses to activate because `resamania-event` is already registered, deactivate the old Resamania workflow first.

## 15A. Route A - Mock Resamania Member Events

### What This Route Does

This route receives mock Resamania events and updates the `Members` and `Leads` sheets.

Supported event types:

```text
member.created
attendance.updated
member.cancelled
```

### Node Map

```text
Resamania Event Webhook
  -> Normalize Resamania Event
  -> Resamania Event Switch

member.created
  -> Prepare Member Created Rows
  -> Upsert Member Row
  -> Update Related Lead to Member
  -> Prepare Welcome Email
  -> Send Welcome Email
  -> Create Review Task
  -> Log Member Created
  -> Respond Member Created

attendance.updated
  -> Prepare Attendance Update
  -> Update Member Attendance
  -> Log Attendance Updated
  -> Respond Attendance Updated

member.cancelled
  -> Prepare Member Cancelled Update
  -> Update Member Cancelled
  -> Create Reactivation Task
  -> Log Member Cancelled
  -> Respond Member Cancelled
```

### Node 1: Resamania Event Webhook

Add `Webhook`.

Rename:

```text
Resamania Event Webhook
```

Settings:

| Setting | Value |
| --- | --- |
| HTTP Method | `POST` |
| Path | `resamania-event` |
| Respond | `Using Respond to Webhook Node` |

Test with:

```text
data/mock-resamania/member-created.json
data/mock-resamania/attendance-updated.json
data/mock-resamania/member-cancelled.json
```

### Node 2: Normalize Resamania Event

Add `Code`.

Rename:

```text
Normalize Resamania Event
```

Paste:

```js
const webhookOutput = $input.first().json || {};
const input = webhookOutput.body || webhookOutput;
const data = input.resamania || input;
const eventType = input.event_type || "resamania.mock_event";

return [
  {
    json: {
      workflow_name: "03 - Member Lifecycle and Retention",
      event_type: eventType,
      member: {
        member_id: data.member_id || data.id || "",
        lead_id: data.lead_id || "",
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        membership_type: data.membership_type || "unknown",
        join_date: data.join_date || new Date().toISOString().slice(0, 10),
        membership_end_date: data.membership_end_date || "",
        last_visit_date: data.last_visit_date || data.join_date || "",
        visit_count_30_days: Number(data.visit_count_30_days || 0),
        interests: Array.isArray(data.interests) ? data.interests.join(",") : (data.interests || ""),
        status: data.status || "active",
        cancellation_reason: data.cancellation_reason || "",
        cancelled_at: data.cancelled_at || "",
      },
      now: new Date().toISOString(),
    },
  },
];
```

### Node 3: Resamania Event Switch

Add `Switch`.

Rename:

```text
Resamania Event Switch
```

Rules:

| Output | Condition |
| --- | --- |
| member.created | `{{$json.event_type}} equals member.created` |
| attendance.updated | `{{$json.event_type}} equals attendance.updated` |
| member.cancelled | `{{$json.event_type}} equals member.cancelled` |

### Branch: member.created

Add `Code`.

Rename:

```text
Prepare Member Created Rows
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const item = $input.first().json;
const member = item.member;
const now = new Date().toISOString();

const memberId = member.member_id || makeId("mem");

const memberRow = {
  member_id: memberId,
  lead_id: member.lead_id,
  name: member.name,
  email: member.email,
  phone: member.phone,
  membership_type: member.membership_type,
  join_date: member.join_date,
  membership_end_date: member.membership_end_date,
  last_visit_date: member.last_visit_date || member.join_date,
  visit_count_30_days: member.visit_count_30_days || 0,
  retention_risk: "none",
  interests: member.interests,
  upsell_candidate: "no",
  review_requested: "no",
  review_requested_at: "",
  status: "active",
  consent_status: "yes",
  opted_out: "FALSE",
};

const welcomeBody = `
Bonjour ${member.name},

Bienvenue chez Elite Club. Nous sommes ravis de vous accompagner.

Pour votre premiere semaine, commencez progressivement et n'hesitez pas a demander conseil a l'equipe.

Sportivement,
L'equipe Elite Club
`.trim();

return [
  {
    json: {
      ...item,
      member_id: memberId,
      member_row: memberRow,
      welcome_email: {
        to: member.email,
        subject: "Bienvenue chez Elite Club",
        body: welcomeBody,
      },
      review_task: {
        task_id: makeId("task"),
        owner: "Gym Owner",
        entity_type: "member",
        entity_id: memberId,
        task_type: "review",
        priority: "medium",
        due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "open",
        notes: "Send review request if member satisfaction is positive.",
        created_at: now,
      },
      log: {
        log_id: makeId("log"),
        workflow_name: item.workflow_name,
        trigger_event: "member.created",
        entity_type: "member",
        entity_id: memberId,
        action_taken: "Member created, onboarding email prepared, review task created",
        status: "success",
        error_message: "",
        created_at: now,
      },
      response: {
        ok: true,
        status: "member_created",
        member_id: memberId,
      },
    },
  },
];
```

### Member Created Node A2: Upsert Member Row

| Setting | Value |
| --- | --- |
| Node | `Google Sheets` |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Members` |
| Matching Column | `member_id` |
| Mapping Mode | Map each column manually |

Map:

| Column | Expression |
| --- | --- |
| `member_id` | `{{$node["Prepare Member Created Rows"].json.member_row.member_id}}` |
| `lead_id` | `{{$node["Prepare Member Created Rows"].json.member_row.lead_id}}` |
| `name` | `{{$node["Prepare Member Created Rows"].json.member_row.name}}` |
| `email` | `{{$node["Prepare Member Created Rows"].json.member_row.email}}` |
| `phone` | `{{$node["Prepare Member Created Rows"].json.member_row.phone}}` |
| `membership_type` | `{{$node["Prepare Member Created Rows"].json.member_row.membership_type}}` |
| `join_date` | `{{$node["Prepare Member Created Rows"].json.member_row.join_date}}` |
| `membership_end_date` | `{{$node["Prepare Member Created Rows"].json.member_row.membership_end_date}}` |
| `last_visit_date` | `{{$node["Prepare Member Created Rows"].json.member_row.last_visit_date}}` |
| `visit_count_30_days` | `{{$node["Prepare Member Created Rows"].json.member_row.visit_count_30_days}}` |
| `retention_risk` | `{{$node["Prepare Member Created Rows"].json.member_row.retention_risk}}` |
| `interests` | `{{$node["Prepare Member Created Rows"].json.member_row.interests}}` |
| `upsell_candidate` | `{{$node["Prepare Member Created Rows"].json.member_row.upsell_candidate}}` |
| `review_requested` | `{{$node["Prepare Member Created Rows"].json.member_row.review_requested}}` |
| `review_requested_at` | `{{$node["Prepare Member Created Rows"].json.member_row.review_requested_at}}` |
| `status` | `{{$node["Prepare Member Created Rows"].json.member_row.status}}` |
| `consent_status` | `{{$node["Prepare Member Created Rows"].json.member_row.consent_status}}` |
| `opted_out` | `{{$node["Prepare Member Created Rows"].json.member_row.opted_out}}` |

### Member Created Node A3: Update Related Lead to Member

Add `Google Sheets`.

Rename:

```text
Update Related Lead to Member
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Leads` |
| Matching Column | `lead_id` |

Map:

| Column | Expression |
| --- | --- |
| `lead_id` | `{{$node["Prepare Member Created Rows"].json.member_row.lead_id}}` |
| `lifecycle_stage` | `member` |
| `updated_at` | `{{$node["Prepare Member Created Rows"].json.now}}` |

### Member Created Node A4: Send Welcome Email

Add `Gmail`.

Rename:

```text
Send Welcome Email
```

Settings:

| Field | Expression |
| --- | --- |
| Credential | `Elite Club Gmail` |
| Resource | `Message` |
| Operation | `Send` |
| To | `{{$node["Prepare Member Created Rows"].json.welcome_email.to}}` |
| Subject | `{{$node["Prepare Member Created Rows"].json.welcome_email.subject}}` |
| Email Type | `Text` |
| Message | `{{$node["Prepare Member Created Rows"].json.welcome_email.body}}` |

### Member Created Node A5: Create Review Task

Add `Google Sheets`.

Rename:

```text
Create Review Task
```

Append to `Tasks` and map:

| Column | Expression |
| --- | --- |
| `task_id` | `{{$node["Prepare Member Created Rows"].json.review_task.task_id}}` |
| `owner` | `{{$node["Prepare Member Created Rows"].json.review_task.owner}}` |
| `entity_type` | `{{$node["Prepare Member Created Rows"].json.review_task.entity_type}}` |
| `entity_id` | `{{$node["Prepare Member Created Rows"].json.review_task.entity_id}}` |
| `task_type` | `{{$node["Prepare Member Created Rows"].json.review_task.task_type}}` |
| `priority` | `{{$node["Prepare Member Created Rows"].json.review_task.priority}}` |
| `due_at` | `{{$node["Prepare Member Created Rows"].json.review_task.due_at}}` |
| `status` | `{{$node["Prepare Member Created Rows"].json.review_task.status}}` |
| `notes` | `{{$node["Prepare Member Created Rows"].json.review_task.notes}}` |
| `created_at` | `{{$node["Prepare Member Created Rows"].json.review_task.created_at}}` |

### Member Created Node A6: Log Member Created

Add `Google Sheets`.

Rename:

```text
Log Member Created
```

Append to `Automation Logs` and map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Member Created Rows"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Member Created Rows"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Member Created Rows"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Member Created Rows"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Member Created Rows"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Member Created Rows"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Member Created Rows"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Member Created Rows"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Member Created Rows"].json.log.created_at}}` |

### Member Created Node A7: Respond Member Created

Add `Respond to Webhook`.

Rename:

```text
Respond Member Created
```

Settings:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Member Created Rows"].json.response) }}` |

### Branch: attendance.updated

Add `Code`.

Rename:

```text
Prepare Attendance Update
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const item = $input.first().json;
const member = item.member;
const now = new Date().toISOString();

return [{
  json: {
    member_update: {
      member_id: member.member_id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      last_visit_date: member.last_visit_date || now.slice(0, 10),
      visit_count_30_days: member.visit_count_30_days || 0,
      status: member.status || "active",
    },
    log: {
      log_id: makeId("log"),
      workflow_name: item.workflow_name,
      trigger_event: "attendance.updated",
      entity_type: "member",
      entity_id: member.member_id,
      action_taken: "Member attendance updated",
      status: "success",
      error_message: "",
      created_at: now,
    },
    response: {
      ok: true,
      status: "attendance_updated",
      member_id: member.member_id,
    }
  }
}];
```

### Attendance Node B2: Update Member Attendance

Add `Google Sheets`.

Rename:

```text
Update Member Attendance
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Members` |
| Matching Column | `member_id` |

Map:

| Column | Expression |
| --- | --- |
| `member_id` | `{{$node["Prepare Attendance Update"].json.member_update.member_id}}` |
| `name` | `{{$node["Prepare Attendance Update"].json.member_update.name}}` |
| `email` | `{{$node["Prepare Attendance Update"].json.member_update.email}}` |
| `phone` | `{{$node["Prepare Attendance Update"].json.member_update.phone}}` |
| `last_visit_date` | `{{$node["Prepare Attendance Update"].json.member_update.last_visit_date}}` |
| `visit_count_30_days` | `{{$node["Prepare Attendance Update"].json.member_update.visit_count_30_days}}` |
| `status` | `{{$node["Prepare Attendance Update"].json.member_update.status}}` |

### Attendance Node B3: Log Attendance Updated

Add `Google Sheets`.

Rename:

```text
Log Attendance Updated
```

Append to `Automation Logs` and map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Attendance Update"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Attendance Update"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Attendance Update"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Attendance Update"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Attendance Update"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Attendance Update"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Attendance Update"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Attendance Update"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Attendance Update"].json.log.created_at}}` |

### Attendance Node B4: Respond Attendance Updated

Add `Respond to Webhook`.

Rename:

```text
Respond Attendance Updated
```

Settings:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Attendance Update"].json.response) }}` |

### Branch: member.cancelled

Add `Code`.

Rename:

```text
Prepare Member Cancelled Update
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const item = $input.first().json;
const member = item.member;
const now = new Date().toISOString();

return [{
  json: {
    member_update: {
      member_id: member.member_id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      status: "cancelled",
      last_visit_date: member.last_visit_date,
    },
    task: {
      task_id: makeId("task"),
      owner: "Gym Owner",
      entity_type: "member",
      entity_id: member.member_id,
      task_type: "follow_up",
      priority: "medium",
      due_at: now,
      status: "open",
      notes: `Former member cancelled. Reason: ${member.cancellation_reason || "unknown"}. Review for reactivation campaign.`,
      created_at: now,
    },
    log: {
      log_id: makeId("log"),
      workflow_name: item.workflow_name,
      trigger_event: "member.cancelled",
      entity_type: "member",
      entity_id: member.member_id,
      action_taken: "Member marked cancelled and reactivation task created",
      status: "queued",
      error_message: "",
      created_at: now,
    },
    response: {
      ok: true,
      status: "member_cancelled",
      member_id: member.member_id,
    }
  }
}];
```

### Cancelled Node C2: Update Member Cancelled

Add `Google Sheets`.

Rename:

```text
Update Member Cancelled
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Members` |
| Matching Column | `member_id` |

Map:

| Column | Expression |
| --- | --- |
| `member_id` | `{{$node["Prepare Member Cancelled Update"].json.member_update.member_id}}` |
| `name` | `{{$node["Prepare Member Cancelled Update"].json.member_update.name}}` |
| `email` | `{{$node["Prepare Member Cancelled Update"].json.member_update.email}}` |
| `phone` | `{{$node["Prepare Member Cancelled Update"].json.member_update.phone}}` |
| `status` | `{{$node["Prepare Member Cancelled Update"].json.member_update.status}}` |
| `last_visit_date` | `{{$node["Prepare Member Cancelled Update"].json.member_update.last_visit_date}}` |

### Cancelled Node C3: Create Reactivation Task

Add `Google Sheets`.

Rename:

```text
Create Reactivation Task
```

Append to `Tasks` and map:

| Column | Expression |
| --- | --- |
| `task_id` | `{{$node["Prepare Member Cancelled Update"].json.task.task_id}}` |
| `owner` | `{{$node["Prepare Member Cancelled Update"].json.task.owner}}` |
| `entity_type` | `{{$node["Prepare Member Cancelled Update"].json.task.entity_type}}` |
| `entity_id` | `{{$node["Prepare Member Cancelled Update"].json.task.entity_id}}` |
| `task_type` | `{{$node["Prepare Member Cancelled Update"].json.task.task_type}}` |
| `priority` | `{{$node["Prepare Member Cancelled Update"].json.task.priority}}` |
| `due_at` | `{{$node["Prepare Member Cancelled Update"].json.task.due_at}}` |
| `status` | `{{$node["Prepare Member Cancelled Update"].json.task.status}}` |
| `notes` | `{{$node["Prepare Member Cancelled Update"].json.task.notes}}` |
| `created_at` | `{{$node["Prepare Member Cancelled Update"].json.task.created_at}}` |

### Cancelled Node C4: Log Member Cancelled

Add `Google Sheets`.

Rename:

```text
Log Member Cancelled
```

Append to `Automation Logs` and map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Member Cancelled Update"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Member Cancelled Update"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Member Cancelled Update"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Member Cancelled Update"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Member Cancelled Update"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Member Cancelled Update"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Member Cancelled Update"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Member Cancelled Update"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Member Cancelled Update"].json.log.created_at}}` |

### Cancelled Node C5: Respond Member Cancelled

Add `Respond to Webhook`.

Rename:

```text
Respond Member Cancelled
```

Settings:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Member Cancelled Update"].json.response) }}` |

## 15B. Route B - Daily Retention Risk

### What This Route Does

Every morning, this route checks active members and flags retention risk based on inactivity.

Risk logic:

| Condition | Risk |
| --- | --- |
| 0-6 inactive days | `none` |
| 7-13 inactive days | `low` |
| 14-20 inactive days | `medium` |
| 21+ inactive days | `high` |

### Node Map

```text
Daily Retention Schedule
  -> Get Active Members
  -> Calculate Retention Risk
  -> Retention Risk Switch

none/low
  -> Update Member Risk Only
  -> Log Retention No Outreach

medium
  -> Can Send Medium Risk Email?
  -> Prepare Medium Risk Email
  -> Send Medium Risk Email
  -> Update Medium Risk Member
  -> Log Medium Risk Interaction
  -> Log Medium Risk Automation

high
  -> Prepare High Risk Task
  -> Add High Risk Task
  -> Update High Risk Member
  -> Log High Risk Automation
```

### Node 1: Daily Retention Schedule

Add `Schedule Trigger`.

Rename:

```text
Daily Retention Schedule
```

Set:

```text
Every day at 08:00
```

### Node 2: Get Active Members

Add `Google Sheets`.

Rename:

```text
Get Active Members
```

Operation:

```text
Get Row(s)
```

Sheet:

```text
Members
```

Filter:

| Column | Operation | Value |
| --- | --- | --- |
| `status` | equals | `active` |

Return All:

```text
On
```

### Node 3: Calculate Retention Risk

Add `Code`.

Rename:

```text
Calculate Retention Risk
```

Mode:

```text
Run Once for Each Item
```

Paste:

```js
function daysBetween(dateText) {
  if (!dateText) return 999;
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return 999;
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

const member = $json;
const inactiveDays = daysBetween(member.last_visit_date);

let risk = "none";
if (inactiveDays >= 21) risk = "high";
else if (inactiveDays >= 14) risk = "medium";
else if (inactiveDays >= 7) risk = "low";

return {
  json: {
    ...member,
    inactive_days: inactiveDays,
    new_retention_risk: risk,
    now: new Date().toISOString(),
  },
};
```

### Node 4: Retention Risk Switch

Add `Switch`.

Rename:

```text
Retention Risk Switch
```

Rules:

| Output | Condition |
| --- | --- |
| none | `{{$json.new_retention_risk}} equals none` |
| low | `{{$json.new_retention_risk}} equals low` |
| medium | `{{$json.new_retention_risk}} equals medium` |
| high | `{{$json.new_retention_risk}} equals high` |

### None/Low Branch: Prepare Retention Risk Only Update

Use this branch for both `none` and `low`.

Add `Code`.

Rename:

```text
Prepare Retention Risk Only Update
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const member = $input.first().json;
const now = new Date().toISOString();

return [{
  json: {
    ...member,
    member_update: {
      ...member,
      retention_risk: member.new_retention_risk,
    },
    log: {
      log_id: makeId("log"),
      workflow_name: "03 - Member Lifecycle and Retention",
      trigger_event: "daily_retention_risk",
      entity_type: "member",
      entity_id: member.member_id,
      action_taken: `Retention risk updated to ${member.new_retention_risk}; no outreach required`,
      status: "success",
      error_message: "",
      created_at: now,
    },
  }
}];
```

### None/Low Node A2: Update Member Risk Only

Add `Google Sheets`.

Rename:

```text
Update Member Risk Only
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Members` |
| Matching Column | `member_id` |

Map:

| Column | Expression |
| --- | --- |
| `member_id` | `{{$node["Prepare Retention Risk Only Update"].json.member_update.member_id}}` |
| `name` | `{{$node["Prepare Retention Risk Only Update"].json.member_update.name}}` |
| `email` | `{{$node["Prepare Retention Risk Only Update"].json.member_update.email}}` |
| `phone` | `{{$node["Prepare Retention Risk Only Update"].json.member_update.phone}}` |
| `retention_risk` | `{{$node["Prepare Retention Risk Only Update"].json.member_update.retention_risk}}` |
| `last_visit_date` | `{{$node["Prepare Retention Risk Only Update"].json.member_update.last_visit_date}}` |
| `visit_count_30_days` | `{{$node["Prepare Retention Risk Only Update"].json.member_update.visit_count_30_days}}` |
| `status` | `{{$node["Prepare Retention Risk Only Update"].json.member_update.status}}` |

### None/Low Node A3: Log Retention No Outreach

Add `Google Sheets`.

Rename:

```text
Log Retention No Outreach
```

Append to `Automation Logs` and map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Retention Risk Only Update"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Retention Risk Only Update"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Retention Risk Only Update"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Retention Risk Only Update"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Retention Risk Only Update"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Retention Risk Only Update"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Retention Risk Only Update"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Retention Risk Only Update"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Retention Risk Only Update"].json.log.created_at}}` |

### Medium Branch: Prepare Medium Risk Email

Before sending, add `IF` named:

```text
Can Send Medium Risk Email?
```

Conditions:

| Value 1 | Operation | Value 2 |
| --- | --- | --- |
| `{{$json.consent_status}}` | equals | `yes` |
| `{{String($json.opted_out).toUpperCase()}}` | not equals | `TRUE` |
| `{{$json.email}}` | is not empty | |

Use the `true` output to send the re-engagement email. Use the `false` output to update the risk and log that outreach was skipped.

### Medium False Branch: Prepare Medium Risk Skipped Outreach

Add this from the `false` output of `Can Send Medium Risk Email?`.

Add `Code`.

Rename:

```text
Prepare Medium Risk Skipped Outreach
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const member = $input.first().json;
const now = new Date().toISOString();

let reason = "Medium risk outreach skipped because member failed the send eligibility check.";
if (String(member.consent_status || "").toLowerCase() !== "yes") {
  reason = "Medium risk outreach skipped because consent is not yes.";
}
if (String(member.opted_out || "").toUpperCase() === "TRUE") {
  reason = "Medium risk outreach skipped because member is opted out.";
}
if (!member.email) {
  reason = "Medium risk outreach skipped because member has no email.";
}

return [{
  json: {
    ...member,
    member_update: {
      ...member,
      retention_risk: "medium",
    },
    log: {
      log_id: makeId("log"),
      workflow_name: "03 - Member Lifecycle and Retention",
      trigger_event: "daily_retention_risk",
      entity_type: "member",
      entity_id: member.member_id,
      action_taken: reason,
      status: "skipped",
      error_message: "",
      created_at: now,
    },
  }
}];
```

### Medium False Node B2F: Update Medium Risk Member Skipped

Add `Google Sheets`.

Rename:

```text
Update Medium Risk Member Skipped
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Members` |
| Matching Column | `member_id` |

Map:

| Column | Expression |
| --- | --- |
| `member_id` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.member_update.member_id}}` |
| `name` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.member_update.name}}` |
| `email` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.member_update.email}}` |
| `phone` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.member_update.phone}}` |
| `retention_risk` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.member_update.retention_risk}}` |
| `last_visit_date` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.member_update.last_visit_date}}` |
| `visit_count_30_days` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.member_update.visit_count_30_days}}` |
| `status` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.member_update.status}}` |

### Medium False Node B3F: Log Medium Risk Skipped Automation

Add `Google Sheets`.

Rename:

```text
Log Medium Risk Skipped Automation
```

Append to `Automation Logs` and map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Medium Risk Skipped Outreach"].json.log.created_at}}` |

### Medium True Branch: Prepare Medium Risk Email

On the `true` output, add `Code` named:

```text
Prepare Medium Risk Email
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const member = $input.first().json;
const now = new Date().toISOString();

const body = `
Bonjour ${member.name},

Nous esperons que vous allez bien. Cela fait quelque temps que nous ne vous avons pas vu chez Elite Club.

Si vous souhaitez reprendre tranquillement, l'equipe peut vous aider a repartir sur une routine simple.

Sportivement,
L'equipe Elite Club
`.trim();

return [{
  json: {
    ...member,
    email: {
      to: member.email,
      subject: "On vous accompagne pour reprendre le rythme",
      body,
    },
    member_update: {
      ...member,
      retention_risk: "medium",
    },
    interaction: {
      interaction_id: makeId("int"),
      person_type: "member",
      person_id: member.member_id,
      channel: "email",
      direction: "outbound",
      message: body,
      ai_generated: "FALSE",
      sent_status: "sent",
      created_at: now,
    },
    log: {
      log_id: makeId("log"),
      workflow_name: "03 - Member Lifecycle and Retention",
      trigger_event: "daily_retention_risk",
      entity_type: "member",
      entity_id: member.member_id,
      action_taken: `Medium retention risk email sent after ${member.inactive_days} inactive days`,
      status: "success",
      error_message: "",
      created_at: now,
    },
  }
}];
```

### Medium Node B2: Send Medium Risk Email

Add `Gmail`.

Rename:

```text
Send Medium Risk Email
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Elite Club Gmail` |
| Resource | `Message` |
| Operation | `Send` |
| To | `{{$node["Prepare Medium Risk Email"].json.email.to}}` |
| Subject | `{{$node["Prepare Medium Risk Email"].json.email.subject}}` |
| Email Type | `Text` |
| Message | `{{$node["Prepare Medium Risk Email"].json.email.body}}` |

### Medium Node B3: Update Medium Risk Member

Add `Google Sheets`.

Rename:

```text
Update Medium Risk Member
```

Use `Append or Update Row` on `Members`, matching `member_id`.

Map:

| Column | Expression |
| --- | --- |
| `member_id` | `{{$node["Prepare Medium Risk Email"].json.member_update.member_id}}` |
| `name` | `{{$node["Prepare Medium Risk Email"].json.member_update.name}}` |
| `email` | `{{$node["Prepare Medium Risk Email"].json.member_update.email}}` |
| `phone` | `{{$node["Prepare Medium Risk Email"].json.member_update.phone}}` |
| `retention_risk` | `{{$node["Prepare Medium Risk Email"].json.member_update.retention_risk}}` |
| `last_visit_date` | `{{$node["Prepare Medium Risk Email"].json.member_update.last_visit_date}}` |
| `visit_count_30_days` | `{{$node["Prepare Medium Risk Email"].json.member_update.visit_count_30_days}}` |
| `status` | `{{$node["Prepare Medium Risk Email"].json.member_update.status}}` |

### Medium Node B4: Log Medium Risk Interaction

Add `Google Sheets`, append to `Interactions`, and map:

| Column | Expression |
| --- | --- |
| `interaction_id` | `{{$node["Prepare Medium Risk Email"].json.interaction.interaction_id}}` |
| `person_type` | `{{$node["Prepare Medium Risk Email"].json.interaction.person_type}}` |
| `person_id` | `{{$node["Prepare Medium Risk Email"].json.interaction.person_id}}` |
| `channel` | `{{$node["Prepare Medium Risk Email"].json.interaction.channel}}` |
| `direction` | `{{$node["Prepare Medium Risk Email"].json.interaction.direction}}` |
| `message` | `{{$node["Prepare Medium Risk Email"].json.interaction.message}}` |
| `ai_generated` | `{{$node["Prepare Medium Risk Email"].json.interaction.ai_generated}}` |
| `sent_status` | `{{$node["Prepare Medium Risk Email"].json.interaction.sent_status}}` |
| `created_at` | `{{$node["Prepare Medium Risk Email"].json.interaction.created_at}}` |

### Medium Node B5: Log Medium Risk Automation

Add `Google Sheets`, append to `Automation Logs`, and map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Medium Risk Email"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Medium Risk Email"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Medium Risk Email"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Medium Risk Email"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Medium Risk Email"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Medium Risk Email"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Medium Risk Email"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Medium Risk Email"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Medium Risk Email"].json.log.created_at}}` |

### High Branch: Prepare High Risk Task

Add `Code` named:

```text
Prepare High Risk Task
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const member = $input.first().json;
const now = new Date().toISOString();

return [{
  json: {
    ...member,
    member_update: {
      ...member,
      retention_risk: "high",
    },
    task: {
      task_id: makeId("task"),
      owner: "Gym Owner",
      entity_type: "member",
      entity_id: member.member_id,
      task_type: "retention_call",
      priority: "high",
      due_at: now,
      status: "open",
      notes: `${member.name} has not visited for ${member.inactive_days} days. Personal outreach recommended.`,
      created_at: now,
    },
    log: {
      log_id: makeId("log"),
      workflow_name: "03 - Member Lifecycle and Retention",
      trigger_event: "daily_retention_risk",
      entity_type: "member",
      entity_id: member.member_id,
      action_taken: `High retention risk task created after ${member.inactive_days} inactive days`,
      status: "queued",
      error_message: "",
      created_at: now,
    },
  }
}];
```

### High Node C2: Add High Risk Task

Add `Google Sheets`.

Rename:

```text
Add High Risk Task
```

Append to `Tasks` and map:

| Column | Expression |
| --- | --- |
| `task_id` | `{{$node["Prepare High Risk Task"].json.task.task_id}}` |
| `owner` | `{{$node["Prepare High Risk Task"].json.task.owner}}` |
| `entity_type` | `{{$node["Prepare High Risk Task"].json.task.entity_type}}` |
| `entity_id` | `{{$node["Prepare High Risk Task"].json.task.entity_id}}` |
| `task_type` | `{{$node["Prepare High Risk Task"].json.task.task_type}}` |
| `priority` | `{{$node["Prepare High Risk Task"].json.task.priority}}` |
| `due_at` | `{{$node["Prepare High Risk Task"].json.task.due_at}}` |
| `status` | `{{$node["Prepare High Risk Task"].json.task.status}}` |
| `notes` | `{{$node["Prepare High Risk Task"].json.task.notes}}` |
| `created_at` | `{{$node["Prepare High Risk Task"].json.task.created_at}}` |

### High Node C3: Update High Risk Member

Add `Google Sheets`.

Rename:

```text
Update High Risk Member
```

Use `Append or Update Row` on `Members`, matching `member_id`.

Map:

| Column | Expression |
| --- | --- |
| `member_id` | `{{$node["Prepare High Risk Task"].json.member_update.member_id}}` |
| `name` | `{{$node["Prepare High Risk Task"].json.member_update.name}}` |
| `email` | `{{$node["Prepare High Risk Task"].json.member_update.email}}` |
| `phone` | `{{$node["Prepare High Risk Task"].json.member_update.phone}}` |
| `retention_risk` | `{{$node["Prepare High Risk Task"].json.member_update.retention_risk}}` |
| `last_visit_date` | `{{$node["Prepare High Risk Task"].json.member_update.last_visit_date}}` |
| `visit_count_30_days` | `{{$node["Prepare High Risk Task"].json.member_update.visit_count_30_days}}` |
| `status` | `{{$node["Prepare High Risk Task"].json.member_update.status}}` |

### High Node C4: Log High Risk Automation

Add `Google Sheets`, append to `Automation Logs`, and map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare High Risk Task"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare High Risk Task"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare High Risk Task"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare High Risk Task"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare High Risk Task"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare High Risk Task"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare High Risk Task"].json.log.status}}` |
| `error_message` | `{{$node["Prepare High Risk Task"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare High Risk Task"].json.log.created_at}}` |

## 15C. Route C - Google Review Request

### What This Route Does

This route sends review requests only when eligible and prevents repeated requests.

Add these optional columns if not already present:

```text
review_requested
review_requested_at
```

### Node Map

```text
Review Request Webhook
  -> Normalize Review Request
  -> Get Member for Review
  -> Check Review Eligibility
  -> Is Review Eligible?
  -> Prepare Review Request Email
  -> Send Review Request Email
  -> Update Review Requested
  -> Log Review Request
  -> Respond Review Request
```

### Node 1: Review Request Webhook

Add `Webhook`.

Rename:

```text
Review Request Webhook
```

Settings:

| Setting | Value |
| --- | --- |
| HTTP Method | `POST` |
| Path | `review-request` |
| Respond | `Using Respond to Webhook Node` |

Payload:

```json
{
  "member_id": "mem_001",
  "satisfaction": "positive"
}
```

### Node 2: Normalize Review Request

Add `Code`.

Paste:

```js
const webhookOutput = $input.first().json || {};
const input = webhookOutput.body || webhookOutput;

return [{
  json: {
    workflow_name: "03 - Member Lifecycle and Retention",
    event_type: "review.requested",
    member_id: String(input.member_id || "").trim(),
    satisfaction: String(input.satisfaction || "").trim().toLowerCase(),
    google_review_url: "https://g.page/r/replace-me/review",
    now: new Date().toISOString(),
  }
}];
```

### Node 3: Get Member for Review

Use `Google Sheets > Get Row(s)` on `Members`, filter:

| Column | Operation | Value |
| --- | --- | --- |
| `member_id` | equals | `{{$json.member_id}}` |

### Node 4: Check Review Eligibility

Add `Code`.

Paste:

```js
const member = $input.first().json;
const request = $node["Normalize Review Request"].json;
const cooldownDays = 90;
const now = new Date();

let eligible = true;
let reason = "eligible";

if (request.satisfaction !== "positive") {
  eligible = false;
  reason = "satisfaction is not positive";
}

if (String(member.consent_status || "").toLowerCase() !== "yes") {
  eligible = false;
  reason = "member consent is not yes";
}

if (String(member.opted_out || "").toUpperCase() === "TRUE") {
  eligible = false;
  reason = "member is opted out";
}

if (String(member.retention_risk || "").toLowerCase() === "high") {
  eligible = false;
  reason = "member is high retention risk";
}

if (member.review_requested_at) {
  const last = new Date(member.review_requested_at);
  const days = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  if (!Number.isNaN(days) && days < cooldownDays) {
    eligible = false;
    reason = `review cooldown active: ${days} days since last request`;
  }
}

return [{
  json: {
    ...member,
    review_eligible: eligible,
    review_reason: reason,
    google_review_url: request.google_review_url,
    now: now.toISOString(),
  }
}];
```

### Node 5: Is Review Eligible?

Add `IF`:

```text
{{$json.review_eligible}} is true
```

Use the `true` output to send the review request. Use the `false` output to log the skip and respond.

### Review False Node F1: Prepare Skipped Review Request

Add this from the `false` output of `Is Review Eligible?`.

Add `Code`.

Rename:

```text
Prepare Skipped Review Request
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const member = $input.first().json;
const now = new Date().toISOString();

return [{
  json: {
    ...member,
    log: {
      log_id: makeId("log"),
      workflow_name: "03 - Member Lifecycle and Retention",
      trigger_event: "review.requested",
      entity_type: "member",
      entity_id: member.member_id,
      action_taken: `Review request skipped: ${member.review_reason}`,
      status: "skipped",
      error_message: "",
      created_at: now,
    },
    response: {
      ok: true,
      status: "review_request_skipped",
      member_id: member.member_id,
      reason: member.review_reason,
    },
  }
}];
```

### Review False Node F2: Log Skipped Review Request

Add `Google Sheets`.

Rename:

```text
Log Skipped Review Request
```

Append to `Automation Logs` and map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Skipped Review Request"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Skipped Review Request"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Skipped Review Request"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Skipped Review Request"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Skipped Review Request"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Skipped Review Request"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Skipped Review Request"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Skipped Review Request"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Skipped Review Request"].json.log.created_at}}` |

### Review False Node F3: Respond Review Request Skipped

Add `Respond to Webhook`.

Rename:

```text
Respond Review Request Skipped
```

Settings:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify($node["Prepare Skipped Review Request"].json.response) }}` |

### Review True Branch

### Node 6: Prepare Review Request Email

Add `Code`.

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const member = $input.first().json;
const now = new Date().toISOString();

const body = `
Bonjour ${member.name},

Nous sommes ravis de vous accompagner chez Elite Club.

Si votre experience vous plait, votre avis Google nous aiderait beaucoup:

${member.google_review_url}

Merci pour votre confiance,
L'equipe Elite Club
`.trim();

return [{
  json: {
    ...member,
    email: {
      to: member.email,
      subject: "Un petit retour sur votre experience ?",
      body,
    },
    member_update: {
      ...member,
      review_requested: "yes",
      review_requested_at: now,
    },
    interaction: {
      interaction_id: makeId("int"),
      person_type: "member",
      person_id: member.member_id,
      channel: "email",
      direction: "outbound",
      message: body,
      ai_generated: "FALSE",
      sent_status: "sent",
      created_at: now,
    },
    log: {
      log_id: makeId("log"),
      workflow_name: "03 - Member Lifecycle and Retention",
      trigger_event: "review.requested",
      entity_type: "member",
      entity_id: member.member_id,
      action_taken: "Google review request sent",
      status: "success",
      error_message: "",
      created_at: now,
    },
  }
}];
```

### Review Node A7: Send Review Request Email

Add `Gmail`.

Rename:

```text
Send Review Request Email
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Elite Club Gmail` |
| Resource | `Message` |
| Operation | `Send` |
| To | `{{$node["Prepare Review Request Email"].json.email.to}}` |
| Subject | `{{$node["Prepare Review Request Email"].json.email.subject}}` |
| Email Type | `Text` |
| Message | `{{$node["Prepare Review Request Email"].json.email.body}}` |

### Review Node A8: Update Member Review Requested

Add `Google Sheets`.

Rename:

```text
Update Member Review Requested
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Members` |
| Matching Column | `member_id` |

Map:

| Column | Expression |
| --- | --- |
| `member_id` | `{{$node["Prepare Review Request Email"].json.member_update.member_id}}` |
| `name` | `{{$node["Prepare Review Request Email"].json.member_update.name}}` |
| `email` | `{{$node["Prepare Review Request Email"].json.member_update.email}}` |
| `phone` | `{{$node["Prepare Review Request Email"].json.member_update.phone}}` |
| `review_requested` | `{{$node["Prepare Review Request Email"].json.member_update.review_requested}}` |
| `review_requested_at` | `{{$node["Prepare Review Request Email"].json.member_update.review_requested_at}}` |
| `status` | `{{$node["Prepare Review Request Email"].json.member_update.status}}` |

### Review Node A9: Log Review Request Interaction

Add `Google Sheets`, append to `Interactions`, and map:

| Column | Expression |
| --- | --- |
| `interaction_id` | `{{$node["Prepare Review Request Email"].json.interaction.interaction_id}}` |
| `person_type` | `{{$node["Prepare Review Request Email"].json.interaction.person_type}}` |
| `person_id` | `{{$node["Prepare Review Request Email"].json.interaction.person_id}}` |
| `channel` | `{{$node["Prepare Review Request Email"].json.interaction.channel}}` |
| `direction` | `{{$node["Prepare Review Request Email"].json.interaction.direction}}` |
| `message` | `{{$node["Prepare Review Request Email"].json.interaction.message}}` |
| `ai_generated` | `{{$node["Prepare Review Request Email"].json.interaction.ai_generated}}` |
| `sent_status` | `{{$node["Prepare Review Request Email"].json.interaction.sent_status}}` |
| `created_at` | `{{$node["Prepare Review Request Email"].json.interaction.created_at}}` |

### Review Node A10: Log Review Request Automation

Add `Google Sheets`, append to `Automation Logs`, and map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Review Request Email"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Review Request Email"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Review Request Email"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Review Request Email"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Review Request Email"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Review Request Email"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Review Request Email"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Review Request Email"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Review Request Email"].json.log.created_at}}` |

### Review Node A11: Respond Review Request Sent

Add `Respond to Webhook`.

Rename:

```text
Respond Review Request Sent
```

Settings:

| Setting | Value |
| --- | --- |
| Respond With | `JSON` |
| Response Code | `200` |
| Response Body | Click `fx` / `Expression`, then paste `{{ JSON.stringify({ ok: true, status: "review_request_sent", member_id: $node["Prepare Review Request Email"].json.member_id }) }}` |

## 16. Workflow 04: Campaign Approval and Sending

Create exactly one n8n workflow:

```text
04 - Campaign Approval and Sending
```

Inside that one workflow canvas, build these three route groups:

```text
Route A - Former Member Reactivation Draft
Route B - Weekly Upsell Recommendation Draft
Route C - Approved Campaign Sender
```

Do **not** create separate workflows named `04A`, `04B`, or `04C`. Those are only route labels. The actual workflow name should be `04 - Campaign Approval and Sending`.

### If You Already Built the Split 04 Version

Use the same migration pattern:

1. Create or open `04 - Campaign Approval and Sending`.
2. Paste the reactivation draft route, weekly upsell route, and approved campaign sender route into the same workflow canvas.
3. Keep the three route groups visually separate.
4. Keep every node name exactly as shown in this guide.
5. Update the Code nodes so every `workflow_name` value says `04 - Campaign Approval and Sending`.
6. Test each route while building.
7. When you are ready to switch production traffic, deactivate the old split workflows first.
8. Activate the combined Workflow 04.

## 16A. Route A - Former Member Reactivation Draft

### What This Route Does

This route looks for cancelled/expired members, creates a personalized reactivation draft, and queues it for owner approval. It does **not** send the campaign directly.

### Node Map

```text
Reactivation Draft Schedule
  -> Get Former Members
  -> Check Reactivation Eligibility
  -> Calculate Reactivation Segment
  -> Prepare Reactivation Draft
  -> Add Reactivation Campaign Approval
  -> Add Reactivation Approval Task
  -> Log Reactivation Draft
```

### Node 1: Reactivation Draft Schedule

Add `Schedule Trigger`.

Rename:

```text
Reactivation Draft Schedule
```

Set:

```text
Every day at 09:00
```

### Node 2: Get Former Members

Add `Google Sheets`.

Rename:

```text
Get Former Members
```

Operation:

```text
Get Row(s)
```

Sheet:

```text
Members
```

Filter:

| Column | Operation | Value |
| --- | --- | --- |
| `status` | equals | `cancelled` |

Return All:

```text
On
```

You can create a second copy of this node for `expired` later.

### Node 3: Check Reactivation Eligibility

Add `IF`.

Rename:

```text
Check Reactivation Eligibility
```

Conditions:

| Value 1 | Operation | Value 2 |
| --- | --- | --- |
| `{{$json.consent_status}}` | equals | `yes` |
| `{{String($json.opted_out).toUpperCase()}}` | not equals | `TRUE` |
| `{{$json.email}}` | is not empty | |

### Node 4: Calculate Reactivation Segment

Add `Code`.

Rename:

```text
Calculate Reactivation Segment
```

Paste:

```js
const member = $input.first().json;
const reason = String(member.cancellation_reason || "").toLowerCase();
const interests = String(member.interests || "").toLowerCase();

let segment = "general_reactivation";
let segmentReason = "General former member reactivation";

if (reason.includes("price") || reason.includes("budget")) {
  segment = "price_sensitive";
  segmentReason = "Cancellation reason suggests price sensitivity";
} else if (reason.includes("schedule") || reason.includes("time")) {
  segment = "schedule_conflict";
  segmentReason = "Cancellation reason suggests schedule conflict";
} else if (interests.includes("weight") || interests.includes("coaching")) {
  segment = "coaching_opportunity";
  segmentReason = "Former member interests suggest coaching angle";
}

return [{
  json: {
    ...member,
    reactivation_segment: segment,
    reactivation_segment_reason: segmentReason,
  }
}];
```

### Node 5: Prepare Reactivation Draft

Use OpenRouter later. For beginner testing, use this mock `Code` node first.

Add `Code`.

Rename:

```text
Prepare Reactivation Draft
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const member = $input.first().json;
const now = new Date().toISOString();

const message = `
Bonjour ${member.name},

Nous esperons que vous allez bien. Nous voulions simplement prendre de vos nouvelles et voir si vous souhaitez reprendre une routine sportive a votre rythme.

Si vous voulez en discuter, repondez simplement a cet email.

Sportivement,
L'equipe Elite Club
`.trim();

const campaignId = makeId("camp");

return [{
  json: {
    ...member,
    campaign: {
      campaign_id: campaignId,
      campaign_name: `Reactivation - ${member.name}`,
      segment: member.reactivation_segment,
      channel: "email",
      status: "approval_needed",
      requires_approval: "TRUE",
      template: message,
      created_at: now,
    },
    task: {
      task_id: makeId("task"),
      owner: "Gym Owner",
      entity_type: "campaign",
      entity_id: campaignId,
      task_type: "approval",
      priority: "medium",
      due_at: now,
      status: "open",
      notes: `Approve or reject reactivation draft for ${member.name}. Segment: ${member.reactivation_segment}. Reason: ${member.reactivation_segment_reason}`,
      created_at: now,
    },
    log: {
      log_id: makeId("log"),
      workflow_name: "04 - Campaign Approval and Sending",
      trigger_event: "reactivation_draft",
      entity_type: "campaign",
      entity_id: campaignId,
      action_taken: "Reactivation campaign draft created for owner approval",
      status: "queued",
      error_message: "",
      created_at: now,
    },
  }
}];
```

### Reactivation Node A6: Add Reactivation Campaign Approval

Add `Google Sheets`.

Rename:

```text
Add Reactivation Campaign Approval
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Campaigns` |

Map:

| Column | Expression |
| --- | --- |
| `campaign_id` | `{{$node["Prepare Reactivation Draft"].json.campaign.campaign_id}}` |
| `campaign_name` | `{{$node["Prepare Reactivation Draft"].json.campaign.campaign_name}}` |
| `segment` | `{{$node["Prepare Reactivation Draft"].json.campaign.segment}}` |
| `channel` | `{{$node["Prepare Reactivation Draft"].json.campaign.channel}}` |
| `status` | `{{$node["Prepare Reactivation Draft"].json.campaign.status}}` |
| `requires_approval` | `{{$node["Prepare Reactivation Draft"].json.campaign.requires_approval}}` |
| `template` | `{{$node["Prepare Reactivation Draft"].json.campaign.template}}` |
| `created_at` | `{{$node["Prepare Reactivation Draft"].json.campaign.created_at}}` |

### Reactivation Node A7: Add Reactivation Approval Task

Add `Google Sheets`.

Rename:

```text
Add Reactivation Approval Task
```

Append to `Tasks` and map:

| Column | Expression |
| --- | --- |
| `task_id` | `{{$node["Prepare Reactivation Draft"].json.task.task_id}}` |
| `owner` | `{{$node["Prepare Reactivation Draft"].json.task.owner}}` |
| `entity_type` | `{{$node["Prepare Reactivation Draft"].json.task.entity_type}}` |
| `entity_id` | `{{$node["Prepare Reactivation Draft"].json.task.entity_id}}` |
| `task_type` | `{{$node["Prepare Reactivation Draft"].json.task.task_type}}` |
| `priority` | `{{$node["Prepare Reactivation Draft"].json.task.priority}}` |
| `due_at` | `{{$node["Prepare Reactivation Draft"].json.task.due_at}}` |
| `status` | `{{$node["Prepare Reactivation Draft"].json.task.status}}` |
| `notes` | `{{$node["Prepare Reactivation Draft"].json.task.notes}}` |
| `created_at` | `{{$node["Prepare Reactivation Draft"].json.task.created_at}}` |

### Reactivation Node A8: Log Reactivation Draft

Add `Google Sheets`.

Rename:

```text
Log Reactivation Draft
```

Append to `Automation Logs` and map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Reactivation Draft"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Reactivation Draft"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Reactivation Draft"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Reactivation Draft"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Reactivation Draft"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Reactivation Draft"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Reactivation Draft"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Reactivation Draft"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Reactivation Draft"].json.log.created_at}}` |

## 16B. Route B - Weekly Upsell Recommendation Draft

### What This Route Does

This route finds active members with upsell signals and creates approval-needed campaign drafts. It does not send automatically.

### Node Map

```text
Weekly Upsell Schedule
  -> Get Active Members for Upsell
  -> Calculate Upsell Signals
  -> Is Upsell Eligible?
  -> Prepare Upsell Campaign Draft
  -> Add Upsell Campaign Approval
  -> Add Upsell Approval Task
  -> Log Upsell Draft
```

### Node 1: Weekly Upsell Schedule

Add `Schedule Trigger`.

Set:

```text
Every Monday at 09:00
```

### Node 2: Get Active Members for Upsell

Use `Google Sheets > Get Row(s)` on `Members`, filter:

| Column | Operation | Value |
| --- | --- | --- |
| `status` | equals | `active` |

Return All:

```text
On
```

### Node 3: Calculate Upsell Signals

Add `Code`.

Mode:

```text
Run Once for Each Item
```

Paste:

```js
const member = $json;
const interests = String(member.interests || "").toLowerCase();
const visits = Number(member.visit_count_30_days || 0);

let recommendedUpsell = "none";
let reason = "No strong upsell signal";

if (interests.includes("weight") || interests.includes("loss")) {
  recommendedUpsell = "personal_coaching";
  reason = "Member has weight loss interest";
} else if (interests.includes("pilates")) {
  recommendedUpsell = "pilates_reformer";
  reason = "Member has Pilates interest";
} else if (visits >= 10) {
  recommendedUpsell = "premium_plan";
  reason = "Member attends frequently";
} else if (interests.includes("nutrition") || interests.includes("supplement")) {
  recommendedUpsell = "supplements";
  reason = "Member has nutrition/supplement interest";
}

const eligible = recommendedUpsell !== "none"
  && String(member.consent_status || "").toLowerCase() === "yes"
  && String(member.opted_out || "").toUpperCase() !== "TRUE"
  && String(member.retention_risk || "").toLowerCase() !== "high";

return {
  json: {
    ...member,
    recommended_upsell: recommendedUpsell,
    upsell_reason: reason,
    upsell_eligible: eligible,
  }
};
```

### Node 4: Is Upsell Eligible?

Add `IF`.

Condition:

```text
{{$json.upsell_eligible}} is true
```

### Node 5: Prepare Upsell Campaign Draft

Add `Code`.

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const member = $input.first().json;
const now = new Date().toISOString();

const readableUpsell = member.recommended_upsell.replaceAll("_", " ");

const message = `
Bonjour ${member.name},

Nous avons remarque que ${member.upsell_reason.toLowerCase()}.

Si vous le souhaitez, nous pouvons vous proposer un echange rapide pour voir si ${readableUpsell} serait adapte a votre objectif.

Sportivement,
L'equipe Elite Club
`.trim();

const campaignId = makeId("camp");

return [{
  json: {
    ...member,
    campaign: {
      campaign_id: campaignId,
      campaign_name: `Upsell - ${member.name} - ${member.recommended_upsell}`,
      segment: member.recommended_upsell,
      channel: "email",
      status: "approval_needed",
      requires_approval: "TRUE",
      template: message,
      created_at: now,
    },
    task: {
      task_id: makeId("task"),
      owner: "Gym Owner",
      entity_type: "campaign",
      entity_id: campaignId,
      task_type: "approval",
      priority: "medium",
      due_at: now,
      status: "open",
      notes: `Approve or reject upsell draft for ${member.name}. Reason: ${member.upsell_reason}`,
      created_at: now,
    },
    log: {
      log_id: makeId("log"),
      workflow_name: "04 - Campaign Approval and Sending",
      trigger_event: "weekly_upsell",
      entity_type: "campaign",
      entity_id: campaignId,
      action_taken: "Upsell campaign draft created for owner approval",
      status: "queued",
      error_message: "",
      created_at: now,
    },
  }
}];
```

### Upsell Node B6: Add Upsell Campaign Approval

Add `Google Sheets`.

Rename:

```text
Add Upsell Campaign Approval
```

Append to `Campaigns` and map:

| Column | Expression |
| --- | --- |
| `campaign_id` | `{{$node["Prepare Upsell Campaign Draft"].json.campaign.campaign_id}}` |
| `campaign_name` | `{{$node["Prepare Upsell Campaign Draft"].json.campaign.campaign_name}}` |
| `segment` | `{{$node["Prepare Upsell Campaign Draft"].json.campaign.segment}}` |
| `channel` | `{{$node["Prepare Upsell Campaign Draft"].json.campaign.channel}}` |
| `status` | `{{$node["Prepare Upsell Campaign Draft"].json.campaign.status}}` |
| `requires_approval` | `{{$node["Prepare Upsell Campaign Draft"].json.campaign.requires_approval}}` |
| `template` | `{{$node["Prepare Upsell Campaign Draft"].json.campaign.template}}` |
| `created_at` | `{{$node["Prepare Upsell Campaign Draft"].json.campaign.created_at}}` |

### Upsell Node B7: Add Upsell Approval Task

Add `Google Sheets`.

Rename:

```text
Add Upsell Approval Task
```

Append to `Tasks` and map:

| Column | Expression |
| --- | --- |
| `task_id` | `{{$node["Prepare Upsell Campaign Draft"].json.task.task_id}}` |
| `owner` | `{{$node["Prepare Upsell Campaign Draft"].json.task.owner}}` |
| `entity_type` | `{{$node["Prepare Upsell Campaign Draft"].json.task.entity_type}}` |
| `entity_id` | `{{$node["Prepare Upsell Campaign Draft"].json.task.entity_id}}` |
| `task_type` | `{{$node["Prepare Upsell Campaign Draft"].json.task.task_type}}` |
| `priority` | `{{$node["Prepare Upsell Campaign Draft"].json.task.priority}}` |
| `due_at` | `{{$node["Prepare Upsell Campaign Draft"].json.task.due_at}}` |
| `status` | `{{$node["Prepare Upsell Campaign Draft"].json.task.status}}` |
| `notes` | `{{$node["Prepare Upsell Campaign Draft"].json.task.notes}}` |
| `created_at` | `{{$node["Prepare Upsell Campaign Draft"].json.task.created_at}}` |

### Upsell Node B8: Log Upsell Draft

Add `Google Sheets`.

Rename:

```text
Log Upsell Draft
```

Append to `Automation Logs` and map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Upsell Campaign Draft"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Upsell Campaign Draft"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Upsell Campaign Draft"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Upsell Campaign Draft"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Upsell Campaign Draft"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Upsell Campaign Draft"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Upsell Campaign Draft"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Upsell Campaign Draft"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Upsell Campaign Draft"].json.log.created_at}}` |

## 16C. Route C - Approved Campaign Sender

### What This Route Does

This route sends only campaigns that the owner approved by changing Campaigns status to:

```text
active
```

It still checks consent and opt-out before sending.

### Node Map

```text
Approved Campaign Sender Schedule
  -> Get Active Campaigns
  -> Prepare Approved Campaign Send
  -> Send Approved Campaign Email
  -> Mark Campaign Complete
  -> Log Approved Campaign Interaction
  -> Log Approved Campaign Automation
```

Important limitation: the current `Campaigns` schema does not contain recipient ID/email. Add these optional columns:

```text
person_type
person_id
recipient_email
recipient_name
```

### Node 1: Approved Campaign Sender Schedule

Add `Schedule Trigger`.

Set:

```text
Every hour
```

### Node 2: Get Active Campaigns

Use `Google Sheets > Get Row(s)` on `Campaigns`, filter:

| Column | Operation | Value |
| --- | --- | --- |
| `status` | equals | `active` |

### Node 3: Prepare Approved Campaign Send

Add `Code`.

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const campaign = $input.first().json;
const now = new Date().toISOString();

return [{
  json: {
    ...campaign,
    email: {
      to: campaign.recipient_email,
      subject: campaign.campaign_name,
      body: campaign.template,
    },
    campaign_update: {
      ...campaign,
      status: "complete",
    },
    interaction: {
      interaction_id: makeId("int"),
      person_type: campaign.person_type || "member",
      person_id: campaign.person_id || "",
      channel: campaign.channel || "email",
      direction: "outbound",
      message: campaign.template,
      ai_generated: "TRUE",
      sent_status: "sent",
      created_at: now,
    },
    log: {
      log_id: makeId("log"),
      workflow_name: "04 - Campaign Approval and Sending",
      trigger_event: "approved_campaign_sender",
      entity_type: "campaign",
      entity_id: campaign.campaign_id,
      action_taken: "Approved campaign sent and marked complete",
      status: "success",
      error_message: "",
      created_at: now,
    },
  }
}];
```

### Approved Campaign Node C4: Send Approved Campaign Email

Add `Gmail`.

Rename:

```text
Send Approved Campaign Email
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Elite Club Gmail` |
| Resource | `Message` |
| Operation | `Send` |
| To | `{{$node["Prepare Approved Campaign Send"].json.email.to}}` |
| Subject | `{{$node["Prepare Approved Campaign Send"].json.email.subject}}` |
| Email Type | `Text` |
| Message | `{{$node["Prepare Approved Campaign Send"].json.email.body}}` |

### Approved Campaign Node C5: Mark Campaign Complete

Add `Google Sheets`.

Rename:

```text
Mark Campaign Complete
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append or Update Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Campaigns` |
| Matching Column | `campaign_id` |

Map:

| Column | Expression |
| --- | --- |
| `campaign_id` | `{{$node["Prepare Approved Campaign Send"].json.campaign_update.campaign_id}}` |
| `campaign_name` | `{{$node["Prepare Approved Campaign Send"].json.campaign_update.campaign_name}}` |
| `segment` | `{{$node["Prepare Approved Campaign Send"].json.campaign_update.segment}}` |
| `channel` | `{{$node["Prepare Approved Campaign Send"].json.campaign_update.channel}}` |
| `status` | `{{$node["Prepare Approved Campaign Send"].json.campaign_update.status}}` |
| `requires_approval` | `{{$node["Prepare Approved Campaign Send"].json.campaign_update.requires_approval}}` |
| `template` | `{{$node["Prepare Approved Campaign Send"].json.campaign_update.template}}` |
| `created_at` | `{{$node["Prepare Approved Campaign Send"].json.campaign_update.created_at}}` |

### Approved Campaign Node C6: Log Approved Campaign Interaction

Add `Google Sheets`, append to `Interactions`, and map:

| Column | Expression |
| --- | --- |
| `interaction_id` | `{{$node["Prepare Approved Campaign Send"].json.interaction.interaction_id}}` |
| `person_type` | `{{$node["Prepare Approved Campaign Send"].json.interaction.person_type}}` |
| `person_id` | `{{$node["Prepare Approved Campaign Send"].json.interaction.person_id}}` |
| `channel` | `{{$node["Prepare Approved Campaign Send"].json.interaction.channel}}` |
| `direction` | `{{$node["Prepare Approved Campaign Send"].json.interaction.direction}}` |
| `message` | `{{$node["Prepare Approved Campaign Send"].json.interaction.message}}` |
| `ai_generated` | `{{$node["Prepare Approved Campaign Send"].json.interaction.ai_generated}}` |
| `sent_status` | `{{$node["Prepare Approved Campaign Send"].json.interaction.sent_status}}` |
| `created_at` | `{{$node["Prepare Approved Campaign Send"].json.interaction.created_at}}` |

### Approved Campaign Node C7: Log Approved Campaign Automation

Add `Google Sheets`, append to `Automation Logs`, and map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$node["Prepare Approved Campaign Send"].json.log.log_id}}` |
| `workflow_name` | `{{$node["Prepare Approved Campaign Send"].json.log.workflow_name}}` |
| `trigger_event` | `{{$node["Prepare Approved Campaign Send"].json.log.trigger_event}}` |
| `entity_type` | `{{$node["Prepare Approved Campaign Send"].json.log.entity_type}}` |
| `entity_id` | `{{$node["Prepare Approved Campaign Send"].json.log.entity_id}}` |
| `action_taken` | `{{$node["Prepare Approved Campaign Send"].json.log.action_taken}}` |
| `status` | `{{$node["Prepare Approved Campaign Send"].json.log.status}}` |
| `error_message` | `{{$node["Prepare Approved Campaign Send"].json.log.error_message}}` |
| `created_at` | `{{$node["Prepare Approved Campaign Send"].json.log.created_at}}` |

## 17. Workflow 99: Error Handler

### What This Workflow Does

This catches unexpected workflow failures and writes them into `Automation Logs`.

Create workflow:

```text
99 - Error Handler
```

### Node Map

```text
Workflow Error Trigger
  -> Prepare Error Log
  -> Append Error Log
  -> Optional Owner Error Email
```

### Node 1: Workflow Error Trigger

Add:

```text
Error Trigger
```

Rename:

```text
Workflow Error Trigger
```

No extra settings are required.

### Node 2: Prepare Error Log

Add:

```text
Code
```

Rename:

```text
Prepare Error Log
```

Paste:

```js
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const error = $json;

const workflowName =
  error.workflow?.name ||
  error.workflowName ||
  error.execution?.workflowName ||
  "unknown_workflow";

const nodeName =
  error.node?.name ||
  error.nodeName ||
  error.lastNodeExecuted ||
  "unknown_node";

const message =
  error.error?.message ||
  error.message ||
  JSON.stringify(error);

const executionUrl =
  error.execution?.url ||
  error.executionUrl ||
  "";

return [
  {
    json: {
      log_id: makeId("log"),
      workflow_name: workflowName,
      trigger_event: "workflow_error",
      entity_type: "system",
      entity_id: "",
      action_taken: `Workflow failed at node: ${nodeName}`,
      status: "failed",
      error_message: `${message}${executionUrl ? ` | execution: ${executionUrl}` : ""}`,
      created_at: new Date().toISOString(),
    },
  },
];
```

### Node 3: Append Error Log

Add:

```text
Google Sheets
```

Rename:

```text
Append Error Log
```

Settings:

| Setting | Value |
| --- | --- |
| Credential | `Gym CRM Google Sheets` |
| Resource | `Sheet Within Document` |
| Operation | `Append Row` |
| Document | `Gym Sales Automation OS - CRM` |
| Sheet | `Automation Logs` |

Map:

| Column | Expression |
| --- | --- |
| `log_id` | `{{$json.log_id}}` |
| `workflow_name` | `{{$json.workflow_name}}` |
| `trigger_event` | `{{$json.trigger_event}}` |
| `entity_type` | `{{$json.entity_type}}` |
| `entity_id` | `{{$json.entity_id}}` |
| `action_taken` | `{{$json.action_taken}}` |
| `status` | `{{$json.status}}` |
| `error_message` | `{{$json.error_message}}` |
| `created_at` | `{{$json.created_at}}` |

### Optional Node 4: Owner Error Email

Add `Gmail` only if you want owner alerts.

To:

```text
your owner email
```

Subject:

```text
n8n workflow error
```

Message:

```text
Workflow: {{$json.workflow_name}}
Action: {{$json.action_taken}}
Error: {{$json.error_message}}
Time: {{$json.created_at}}
```

### Attach Error Workflow

For each main workflow:

1. Open the workflow.
2. Open workflow settings.
3. Find `Error Workflow`.
4. Choose `99 - Error Handler`.
5. Save.

## 18. Common Beginner Mistakes

### Mistake 1: The workflow stops after a Google Sheets search

Cause:

```text
No row was found and Always Output Data is off.
```

Fix:

Open the Google Sheets search node, go to `Settings`, and turn on:

```text
Always Output Data
```

### Mistake 2: Code says it cannot find a node

Cause:

```text
You renamed a node that code references.
```

Fix:

Either rename the node back exactly, or update the code.

Example:

```js
$node["Normalize and Validate Lead"].json
```

requires a node named:

```text
Normalize and Validate Lead
```

### Mistake 3: OpenRouter returns text instead of JSON

Cause:

```text
The model ignored the schema or the HTTP body was not sent correctly.
```

Fix:

- Check `response_format` is inside the HTTP body.
- Keep `temperature` low, for example `0.2`.
- Confirm your selected OpenRouter model supports structured outputs.

### Mistake 3B: OpenRouter says too many requests / 429

Cause:

```text
You are being rate limited by OpenRouter or by the upstream model provider.
```

This can happen when you click `Execute step` many times while building, when the selected model is overloaded, or when you use a free/limited model.

Important: do not show your OpenRouter API key in screenshots. If you accidentally expose it, rotate the key in OpenRouter.

Beginner fix:

1. Stop clicking `Execute step` repeatedly.
2. Wait 1-5 minutes.
3. In the `Qualify Lead with OpenRouter` node, open `Settings`.
4. Turn on:

```text
Retry On Fail
```

5. Set:

| Setting | Value |
| --- | --- |
| Max Tries | `3` |
| Wait Between Tries | `5000` |

6. While building the rest of the workflow, temporarily use a mock AI node so you do not keep spending requests.

#### Temporary Mock AI Node

Use this only while building/testing.

Instead of connecting:

```text
Prepare OpenRouter Request -> Qualify Lead with OpenRouter -> Parse AI Qualification
```

temporarily connect:

```text
Prepare OpenRouter Request -> Mock OpenRouter Response -> Parse AI Qualification
```

Add a `Code` node named:

```text
Mock OpenRouter Response
```

Paste:

```js
const source = $input.first().json;

const mockAi = {
  lead_temperature: "hot",
  lead_score: 88,
  intent: "trial_booking",
  interested_service: "personal_training",
  fitness_goal: source.lead.fitness_goal || "weight_loss",
  urgency: "this_week",
  budget_sensitivity: "unknown",
  preferred_channel: source.lead.preferred_channel || "email",
  summary: "Lead wants a trial session this week and is interested in personal training.",
  recommended_next_action: "Offer available trial slots and ask for preferred time.",
  suggested_reply_fr: "Bonjour, merci pour votre message. Nous pouvons vous proposer une seance d'essai cette semaine. Preferez-vous venir en matinee ou en soiree ?",
  risk_flags: [],
  automation_allowed: true
};

return [
  {
    json: {
      ...source,
      choices: [
        {
          message: {
            content: JSON.stringify(mockAi)
          }
        }
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    }
  }
];
```

After the whole workflow works, reconnect the real OpenRouter HTTP Request node.

### Mistake 4: Emails send when consent is unknown

Cause:

```text
Consent route logic is wrong.
```

Fix:

The `Decide Follow-Up Route` Code node must route `consent_status = unknown` to:

```text
queue_manual
```

not:

```text
send_email
```

### Mistake 5: Blank n8n page on localhost

For local PowerShell use:

```powershell
$env:N8N_SECURE_COOKIE='false'
n8n
```

Then open:

```text
http://localhost:5678
```

## 19. Minimum Portfolio Screenshot Checklist

Take screenshots of:

1. Full Workflow 01 canvas
2. `Normalize and Validate Lead` Code node
3. `Qualify Lead with OpenRouter` HTTP Request node, with API key hidden
4. `Decide Follow-Up Route` Code node
5. `Follow-Up Route Switch`
6. Google Sheets `Leads` row after AI qualification
7. Google Sheets `Interactions` row
8. Google Sheets `Automation Logs` row
9. Manual task created for consent unknown
10. Skipped log created for opted-out lead
