"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Check,
  ClipboardList,
  Dumbbell,
  FileText,
  Gauge,
  Loader2,
  Megaphone,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/backend";

const navItems = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "intake", label: "Lead Intake", icon: UserPlus },
  { id: "pipeline", label: "Pipeline", icon: BarChart3 },
  { id: "members", label: "Members", icon: Users },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "logs", label: "Logs", icon: FileText },
];

const pageTitles = {
  overview: "Operations Overview",
  intake: "Public Lead Intake",
  pipeline: "Lead Pipeline",
  members: "Member Retention",
  tasks: "Task Queue",
  campaigns: "Campaign Approvals",
  logs: "Automation Logs",
};

export default function Home() {
  const [activeView, setActiveView] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [leads, setLeads] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ q: "", stage: "", temperature: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState({});
  const [formStatus, setFormStatus] = useState("");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    refreshLeads(filters);
  }, [filters]);

  async function refreshAll() {
    setLoading(true);
    try {
      const [dashboardData, leadsData, membersData, tasksData, campaignsData, logsData] =
        await Promise.all([
          api("/dashboard"),
          api("/leads"),
          api("/members"),
          api("/tasks"),
          api("/campaigns"),
          api("/logs"),
        ]);

      setDashboard(dashboardData);
      setLeads(leadsData);
      setMembers(membersData);
      setTasks(tasksData);
      setCampaigns(campaignsData);
      setLogs(logsData);
      setApiError("");
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function refreshLeads(nextFilters) {
    const params = new URLSearchParams();
    if (nextFilters.q) params.set("q", nextFilters.q);
    if (nextFilters.stage) params.set("stage", nextFilters.stage);
    if (nextFilters.temperature) params.set("temperature", nextFilters.temperature);
    try {
      const data = await api(`/leads?${params.toString()}`);
      setLeads(data);
      setApiError("");
    } catch (error) {
      setApiError(error.message);
    }
  }

  async function handleLeadSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFormStatus("Submitting lead...");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    data.opted_out = form.elements.opted_out.checked;
    data.source = "next_frontend";

    try {
      const result = await api("/leads", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setSubmitResult(result);
      setFormStatus("Lead submitted successfully.");
      setApiError("");
      form.reset();
      await refreshAll();
    } catch (error) {
      setSubmitResult(error.payload || { error: error.message });
      setFormStatus("Submission failed.");
      setApiError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function completeTask(taskId) {
    try {
      await api(`/tasks/${taskId}/complete`, { method: "POST" });
      await refreshAll();
    } catch (error) {
      setApiError(error.message);
    }
  }

  async function decideCampaign(campaignId, decision) {
    try {
      await api(`/campaigns/${campaignId}/decision`, {
        method: "POST",
        body: JSON.stringify({ decision }),
      });
      await refreshAll();
    } catch (error) {
      setApiError(error.message);
    }
  }

  const metrics = useMemo(() => {
    const summary = dashboard?.summary || {};
    return [
      ["Total leads", summary.leads_total || 0, "All captured contacts", UserPlus],
      ["Hot leads", summary.hot_leads || 0, "High-intent prospects", Sparkles],
      ["Active members", summary.active_members || 0, "Current memberships", Dumbbell],
      ["High risk", summary.high_risk_members || 0, "Retention attention", Bell],
      ["Open tasks", summary.open_tasks || 0, "Owner workload", ClipboardList],
      ["Approvals", summary.approval_needed || 0, "Campaign review", ShieldCheck],
      ["Success today", summary.success_today || 0, "Automation actions", Activity],
      ["Queued/skipped", summary.skipped_or_queued || 0, "Compliance signals", SlidersHorizontal],
    ];
  }, [dashboard]);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">
            <Dumbbell size={21} strokeWidth={2.5} />
          </div>
          <div>
            <strong>PlugWheel</strong>
            <span>Gym Sales OS</span>
          </div>
        </div>

        <nav className="nav-stack" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-button ${activeView === item.id ? "is-active" : ""}`}
                onClick={() => setActiveView(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="connection-panel">
          <span className={dashboard?.connection?.worker_configured ? "dot online" : "dot pending"} />
          <div>
            <strong>
              {dashboard?.connection?.worker_configured ? "Worker proxy active" : "Demo local mode"}
            </strong>
            <span>{dashboard?.connection?.worker_base_url || "Express stores demo state locally."}</span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Owner Back Office</p>
            <h1>{pageTitles[activeView]}</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" onClick={refreshAll} aria-label="Refresh data">
              {loading ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}
            </button>
            <a className="text-button" href={`${API_BASE}/health`} target="_blank" rel="noreferrer">
              API
            </a>
          </div>
        </header>

        {apiError && (
          <div className="api-alert" role="status">
            <strong>Backend connection failed.</strong>
            <span>{apiError}. Start Express with <code>npm.cmd run backend:dev</code> or run both services with <code>npm.cmd run app:dev</code>.</span>
          </div>
        )}

        {activeView === "overview" && (
          <OverviewView
            metrics={metrics}
            dashboard={dashboard}
            tasks={dashboard?.priority_tasks || []}
            logs={dashboard?.recent_logs || []}
          />
        )}
        {activeView === "intake" && (
          <IntakeView
            onSubmit={handleLeadSubmit}
            submitting={submitting}
            status={formStatus}
            result={submitResult}
          />
        )}
        {activeView === "pipeline" && (
          <PipelineView leads={leads} filters={filters} setFilters={setFilters} />
        )}
        {activeView === "members" && <MembersView members={members} />}
        {activeView === "tasks" && <TasksView tasks={tasks} onComplete={completeTask} />}
        {activeView === "campaigns" && (
          <CampaignsView campaigns={campaigns} onDecision={decideCampaign} />
        )}
        {activeView === "logs" && <LogsView logs={logs} />}
      </section>
    </main>
  );
}

function OverviewView({ metrics, dashboard, tasks, logs }) {
  return (
    <div className="view-stack">
      <section className="metric-grid">
        {metrics.map(([label, value, note, Icon]) => (
          <article className="metric-card" key={label}>
            <div className="metric-icon">
              <Icon size={18} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </section>

      <section className="split-grid">
        <Panel title="Sales Pipeline" meta="Live CRM stages">
          <BarChart items={dashboard?.pipeline || []} tone="pipeline" />
        </Panel>
        <Panel title="Retention Risk" meta="Member health">
          <BarChart items={dashboard?.retention || []} tone="risk" />
        </Panel>
      </section>

      <section className="split-grid">
        <Panel title="Priority Work" meta="Open tasks">
          <ListStack
            items={tasks}
            empty="No open tasks."
            render={(task) => (
              <div className="list-item">
                <div className="item-line">
                  <strong>{titleize(task.task_type)}</strong>
                  <Badge value={task.priority} />
                </div>
                <p>{task.notes}</p>
                <span className="muted">
                  {task.entity_type} {task.entity_id}
                </span>
              </div>
            )}
          />
        </Panel>
        <Panel title="Recent Automation" meta="Latest logs">
          <ListStack
            items={logs}
            empty="No automation logs yet."
            render={(log) => (
              <div className="list-item">
                <div className="item-line">
                  <strong>{log.workflow_name}</strong>
                  <Badge value={log.status} />
                </div>
                <p>{log.action_taken}</p>
              </div>
            )}
          />
        </Panel>
      </section>
    </div>
  );
}

function IntakeView({ onSubmit, submitting, status, result }) {
  return (
    <section className="intake-grid">
      <Panel title="Trial Request" meta="Public frontend form">
        <form className="lead-form" onSubmit={onSubmit}>
          <label>
            Full name
            <input name="name" required placeholder="Claire Martin" autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" placeholder="claire@example.com" autoComplete="email" />
          </label>
          <label>
            Phone
            <input name="phone" placeholder="+33601020304" autoComplete="tel" />
          </label>
          <div className="form-row">
            <label>
              Goal
              <select name="fitness_goal" defaultValue="weight_loss">
                <option value="weight_loss">Weight loss</option>
                <option value="strength">Strength</option>
                <option value="general_fitness">General fitness</option>
                <option value="low_impact">Low impact</option>
              </select>
            </label>
            <label>
              Service
              <select name="interested_service" defaultValue="personal_training">
                <option value="personal_training">Personal training</option>
                <option value="membership">Membership</option>
                <option value="pilates">Pilates</option>
                <option value="supplements">Supplements</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>
          </div>
          <label>
            Message
            <textarea
              name="message"
              rows={5}
              required
              placeholder="Bonjour, je voudrais faire une seance d'essai cette semaine."
            />
          </label>
          <div className="form-row">
            <label>
              Consent
              <select name="consent_status" defaultValue="yes">
                <option value="yes">Yes</option>
                <option value="unknown">Unknown</option>
                <option value="no">No</option>
              </select>
            </label>
            <label>
              Channel
              <select name="preferred_channel" defaultValue="email">
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="call">Call</option>
              </select>
            </label>
          </div>
          <label className="checkbox-line">
            <input name="opted_out" type="checkbox" />
            <span>Opted out</span>
          </label>
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
            Submit Lead
          </button>
          <p className="form-status">{status}</p>
        </form>
      </Panel>

      <Panel title="Routing Result" meta="Express response">
        <pre className="response-preview">{JSON.stringify(result, null, 2)}</pre>
      </Panel>
    </section>
  );
}

function PipelineView({ leads, filters, setFilters }) {
  return (
    <div className="view-stack">
      <div className="tool-strip">
        <label className="search-input">
          <Search size={17} />
          <input
            value={filters.q}
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            placeholder="Search leads"
          />
        </label>
        <select
          value={filters.stage}
          onChange={(event) => setFilters((current) => ({ ...current, stage: event.target.value }))}
        >
          <option value="">All stages</option>
          {["new", "qualified", "trial_requested", "trial_booked", "trial_attended", "member", "lost", "nurture"].map(
            (stage) => (
              <option value={stage} key={stage}>
                {titleize(stage)}
              </option>
            )
          )}
        </select>
        <select
          value={filters.temperature}
          onChange={(event) =>
            setFilters((current) => ({ ...current, temperature: event.target.value }))
          }
        >
          <option value="">All temperatures</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </select>
      </div>
      <Panel title="Leads" meta={`${leads.length} visible`}>
        <DataTable
          headers={["Lead", "Score", "Stage", "Consent", "Next action"]}
          rows={leads.map((lead) => [
            <PersonCell key="lead" name={lead.name} sub={lead.email || lead.phone} />,
            <div key="score" className="score-cell">
              <strong>{lead.lead_score}</strong>
              <Badge value={lead.lead_temperature} />
            </div>,
            <Badge key="stage" value={lead.lifecycle_stage} />,
            <Badge key="consent" value={lead.consent_status} />,
            lead.next_action || "",
          ])}
        />
      </Panel>
    </div>
  );
}

function MembersView({ members }) {
  return (
    <Panel title="Members" meta={`${members.length} records`}>
      <DataTable
        headers={["Member", "Plan", "Last visit", "30-day visits", "Risk", "Upsell"]}
        rows={members.map((member) => [
          <PersonCell key="member" name={member.name} sub={member.email || member.phone} />,
          titleize(member.membership_type),
          member.last_visit_date || "Not recorded",
          member.visit_count_30_days || 0,
          <Badge key="risk" value={member.retention_risk} />,
          <Badge key="upsell" value={member.upsell_candidate} />,
        ])}
      />
    </Panel>
  );
}

function TasksView({ tasks, onComplete }) {
  return (
    <Panel title="Tasks" meta={`${tasks.length} total`}>
      <ListStack
        items={tasks}
        empty="No tasks found."
        render={(task) => (
          <div className="list-item">
            <div className="item-line">
              <strong>{titleize(task.task_type)}</strong>
              <Badge value={task.priority} />
            </div>
            <p>{task.notes}</p>
            <div className="item-line">
              <span className="muted">
                {task.entity_type} {task.entity_id}
              </span>
              {task.status === "open" ? (
                <button className="small-button" type="button" onClick={() => onComplete(task.task_id)}>
                  <Check size={16} />
                  Done
                </button>
              ) : (
                <Badge value={task.status} />
              )}
            </div>
          </div>
        )}
      />
    </Panel>
  );
}

function CampaignsView({ campaigns, onDecision }) {
  return (
    <Panel title="Campaigns" meta={`${campaigns.length} campaigns`}>
      <ListStack
        items={campaigns}
        empty="No campaigns found."
        render={(campaign) => (
          <div className="campaign-card">
            <div className="item-line">
              <strong>{campaign.campaign_name}</strong>
              <Badge value={campaign.status} />
            </div>
            <span className="muted">
              {campaign.segment} via {campaign.channel}
            </span>
            <p>{campaign.template}</p>
            <div className="button-row">
              <button
                className="small-button"
                type="button"
                onClick={() => onDecision(campaign.campaign_id, "approve")}
              >
                <Check size={16} />
                Approve
              </button>
              <button
                className="small-button danger"
                type="button"
                onClick={() => onDecision(campaign.campaign_id, "reject")}
              >
                Reject
              </button>
            </div>
          </div>
        )}
      />
    </Panel>
  );
}

function LogsView({ logs }) {
  return (
    <Panel title="Automation Logs" meta={`${logs.length} recent`}>
      <DataTable
        headers={["Workflow", "Entity", "Action", "Status", "Time"]}
        rows={logs.map((log) => [
          log.workflow_name,
          `${log.entity_type} ${log.entity_id || ""}`,
          log.action_taken,
          <Badge key="status" value={log.status} />,
          formatDate(log.created_at),
        ])}
      />
    </Panel>
  );
}

function Panel({ title, meta, children }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        <span>{meta}</span>
      </div>
      {children}
    </section>
  );
}

function BarChart({ items, tone }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return (
    <div className="bar-chart">
      {items.map((item) => (
        <div className="bar-row" key={item.stage || item.risk}>
          <span>{item.label}</span>
          <div className="bar-track">
            <div
              className={`bar-fill ${toneClass(tone, item.stage || item.risk)}`}
              style={{ width: `${Math.max(4, Math.round((item.count / max) * 100))}%` }}
            />
          </div>
          <strong>{item.count}</strong>
        </div>
      ))}
    </div>
  );
}

function DataTable({ headers, rows }) {
  if (!rows.length) {
    return <div className="empty-state">No records found.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListStack({ items, empty, render }) {
  if (!items.length) {
    return <div className="empty-state">{empty}</div>;
  }

  return <div className="list-stack">{items.map((item) => <div key={item.task_id || item.log_id || item.campaign_id}>{render(item)}</div>)}</div>;
}

function PersonCell({ name, sub }) {
  return (
    <div className="person-cell">
      <strong>{name}</strong>
      <span>{sub}</span>
    </div>
  );
}

function Badge({ value }) {
  const raw = String(value || "unknown");
  return <span className={`badge ${raw.replace(/\s+/g, "-")}`}>{titleize(raw)}</span>;
}

async function api(path, options = {}) {
  let result;
  try {
    result = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      cache: "no-store",
      ...options,
    });
  } catch {
    throw new Error("Express backend is not reachable at http://localhost:4000");
  }

  const contentType = result.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await result.json()
    : { error: await result.text() };

  if (!result.ok) {
    const error = new Error(payload.error || "Request failed");
    error.payload = payload;
    throw error;
  }

  return payload;
}

function titleize(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toneClass(tone, value) {
  if (tone !== "risk") return "";
  if (value === "high") return "red";
  if (value === "medium" || value === "renewal") return "amber";
  if (value === "low" || value === "service") return "blue";
  return "";
}
