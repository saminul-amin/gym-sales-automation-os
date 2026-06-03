# Owner Dashboard Specification

The MVP dashboard can be built as a Google Sheets dashboard using pivot tables, formulas, filters, and charts. A lightweight web dashboard can be added later after the automations are stable.

## Dashboard Tabs

### 1. Sales Pipeline

Show lead counts by lifecycle stage:

- New
- Qualified
- Trial requested
- Trial booked
- Trial attended
- Member
- Lost
- Nurture

Recommended views:

- Pipeline count by stage
- Hot leads created in the last 7 days
- Leads needing follow-up today
- Conversion rate from trial attended to member

### 2. Today's Tasks

Filter `Tasks` where:

- `status = open`
- `due_at <= today + 1 day`

Group by:

- Priority
- Task type
- Owner

### 3. Retention View

Show:

- Active members
- Low-risk members
- Medium-risk members
- High-risk members
- Inactive 14+ days
- Inactive 21+ days
- Renewal risk within 10 days

### 4. Campaign Approvals

Filter `Campaigns` where:

- `status = approval_needed`
- `requires_approval = TRUE`

Include a review table with:

- Campaign name
- Segment
- Channel
- Draft message
- Approve/reject status

### 5. Automation Logs

Show the latest 100 logs with filters for:

- Workflow name
- Status
- Entity type
- Date

Recommended metrics:

- Successful actions today
- Failed actions today
- Skipped messages due to consent
- Queued manual messages

## Professional Dashboard Rules

- Use clear stage names, not internal codes.
- Keep error logs visible, not hidden.
- Separate campaign approvals from automatically sent transactional emails.
- Highlight high-risk members and hot leads.
- Track skipped actions as a healthy compliance signal, not as a failure.

