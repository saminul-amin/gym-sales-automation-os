# Google Sheets CRM Schema

Create one spreadsheet named `Gym Sales Automation OS - CRM` with the tabs below.

## Leads

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| lead_id | Text | Yes | Use `lead_` + timestamp or UUID |
| name | Text | Yes | Contact name |
| email | Email | Conditional | Email or phone required |
| phone | Text | Conditional | Email or phone required |
| source | Dropdown | Yes | website, manual, csv, instagram, facebook, whatsapp, resamania |
| original_message | Long text | No | Raw inquiry |
| fitness_goal | Text | No | From form or AI |
| interested_service | Dropdown | No | membership, personal_training, pilates, supplements, unknown |
| lead_temperature | Dropdown | No | hot, warm, cold |
| lead_score | Number | No | 0 to 100 |
| lifecycle_stage | Dropdown | Yes | new, qualified, trial_requested, trial_booked, trial_attended, member, lost, nurture |
| consent_status | Dropdown | Yes | yes, no, unknown |
| preferred_channel | Dropdown | No | email, whatsapp, sms, call |
| ai_summary | Long text | No | Owner-facing summary |
| next_action | Text | No | Suggested next action |
| assigned_to | Text | No | Owner or staff |
| created_at | DateTime | Yes | ISO timestamp preferred |
| updated_at | DateTime | Yes | ISO timestamp preferred |
| last_contacted_at | DateTime | No | Updated after outbound |
| opted_out | Checkbox | Yes | TRUE/FALSE |

## Members

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| member_id | Text | Yes | Use `mem_` + timestamp or UUID |
| lead_id | Text | No | Link back to lead |
| name | Text | Yes | Member name |
| email | Email | No |  |
| phone | Text | No |  |
| membership_type | Dropdown | Yes | basic, premium, coaching, pilates, unknown |
| join_date | Date | Yes |  |
| membership_end_date | Date | No | Used for renewal risk |
| last_visit_date | Date | No | Used for inactivity |
| visit_count_30_days | Number | No |  |
| retention_risk | Dropdown | Yes | none, low, medium, high, renewal, service |
| interests | Text | No | Comma-separated in Sheets MVP |
| upsell_candidate | Dropdown | Yes | yes, no |
| review_requested | Dropdown | Yes | yes, no |
| review_requested_at | DateTime | No | Cooldown check |
| status | Dropdown | Yes | active, paused, cancelled, expired |
| consent_status | Dropdown | Yes | yes, no, unknown |
| opted_out | Checkbox | Yes | TRUE/FALSE |

## Interactions

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| interaction_id | Text | Yes | UUID |
| person_type | Dropdown | Yes | lead, member |
| person_id | Text | Yes | lead_id or member_id |
| channel | Dropdown | Yes | email, whatsapp, sms, instagram, facebook, manual, system |
| direction | Dropdown | Yes | inbound, outbound, internal |
| message | Long text | Yes | Message body or summary |
| ai_generated | Checkbox | Yes | TRUE/FALSE |
| sent_status | Dropdown | Yes | sent, queued, failed, skipped |
| created_at | DateTime | Yes |  |

## Automation Logs

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| log_id | Text | Yes | UUID |
| workflow_name | Text | Yes | n8n workflow name |
| trigger_event | Text | Yes | Event name |
| entity_type | Dropdown | Yes | lead, member, campaign, system |
| entity_id | Text | No |  |
| action_taken | Text | Yes |  |
| status | Dropdown | Yes | success, failed, skipped, queued |
| error_message | Long text | No | Required for failed |
| created_at | DateTime | Yes |  |

## Campaigns

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| campaign_id | Text | Yes | UUID |
| campaign_name | Text | Yes |  |
| segment | Text | Yes |  |
| channel | Dropdown | Yes | email, whatsapp, sms |
| status | Dropdown | Yes | draft, approval_needed, active, paused, complete |
| requires_approval | Checkbox | Yes | TRUE/FALSE |
| template | Long text | Yes |  |
| created_at | DateTime | Yes |  |

## Tasks

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| task_id | Text | Yes | UUID |
| owner | Text | Yes | Staff/owner |
| entity_type | Dropdown | Yes | lead, member, campaign |
| entity_id | Text | Yes |  |
| task_type | Dropdown | Yes | follow_up, approval, retention_call, booking, review |
| priority | Dropdown | Yes | low, medium, high |
| due_at | DateTime | No |  |
| status | Dropdown | Yes | open, done, cancelled |
| notes | Long text | No |  |
| created_at | DateTime | Yes |  |

## Settings

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| setting_name | Text | Yes | Unique key |
| value | Text | Yes | Keep secrets outside Sheets if possible |
| description | Text | No |  |

Recommended Settings rows:

- `OPENROUTER_MODEL`
- `OPENROUTER_FALLBACK_MODEL`
- `GOOGLE_REVIEW_URL`
- `REVIEW_COOLDOWN_DAYS`
- `TRIAL_REMINDER_HOURS`
- `RETENTION_LOW_DAYS`
- `RETENTION_MEDIUM_DAYS`
- `RETENTION_HIGH_DAYS`
- `DEFAULT_ASSIGNEE`
- `OWNER_EMAIL`
