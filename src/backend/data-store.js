const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.join(ROOT, "data");
const STATE_FILE = path.join(DATA_DIR, "app-state.json");

const LEAD_STAGES = [
  "new",
  "qualified",
  "trial_requested",
  "trial_booked",
  "trial_attended",
  "member",
  "lost",
  "nurture",
];

function readCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const rows = parseCsv(text);
  const [headers, ...records] = rows;

  return records
    .filter((row) => row.some((value) => String(value || "").trim() !== ""))
    .map((row) => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index] || "";
      });
      return item;
    });
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  }

  return createSeedState();
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function createSeedState() {
  const leads = readCsv(path.join(DATA_DIR, "sample-leads.csv")).map((lead) => ({
    ...lead,
    lead_score: Number(lead.lead_score || 0),
    opted_out: toBoolean(lead.opted_out),
  }));

  const members = readCsv(path.join(DATA_DIR, "sample-members.csv")).map((member) => ({
    ...member,
    visit_count_30_days: Number(member.visit_count_30_days || 0),
    opted_out: toBoolean(member.opted_out),
  }));

  const now = new Date();
  const today = now.toISOString();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  return {
    leads,
    members,
    tasks: [
      {
        task_id: "task_001",
        owner: "Gym Owner",
        entity_type: "lead",
        entity_id: "lead_002",
        task_type: "follow_up",
        priority: "high",
        due_at: today,
        status: "open",
        notes: "Consent is unknown. Review before sending any marketing follow-up.",
        created_at: today,
      },
      {
        task_id: "task_002",
        owner: "Gym Owner",
        entity_type: "member",
        entity_id: "mem_003",
        task_type: "retention_call",
        priority: "high",
        due_at: today,
        status: "open",
        notes: "High retention risk. No visits in the last 30 days.",
        created_at: today,
      },
      {
        task_id: "task_003",
        owner: "Gym Owner",
        entity_type: "campaign",
        entity_id: "camp_001",
        task_type: "approval",
        priority: "medium",
        due_at: tomorrow,
        status: "open",
        notes: "Review reactivation campaign before sending.",
        created_at: today,
      },
    ],
    campaigns: [
      {
        campaign_id: "camp_001",
        campaign_name: "Former Member Reactivation",
        segment: "Cancelled members inactive 30+ days",
        channel: "email",
        status: "approval_needed",
        requires_approval: true,
        template:
          "Bonjour {{name}}, we would be happy to welcome you back with a guided restart session.",
        created_at: today,
      },
      {
        campaign_id: "camp_002",
        campaign_name: "Premium Coaching Upsell",
        segment: "Active basic members with coaching interest",
        channel: "email",
        status: "draft",
        requires_approval: true,
        template:
          "Bonjour {{name}}, your recent goals suggest personal coaching may help you progress faster.",
        created_at: today,
      },
    ],
    interactions: [
      {
        interaction_id: "int_001",
        person_type: "lead",
        person_id: "lead_001",
        channel: "email",
        direction: "outbound",
        message: "Trial slots offered for this week.",
        ai_generated: true,
        sent_status: "sent",
        created_at: today,
      },
      {
        interaction_id: "int_002",
        person_type: "lead",
        person_id: "lead_002",
        channel: "manual",
        direction: "internal",
        message: "Manual review required because consent is unknown.",
        ai_generated: true,
        sent_status: "queued",
        created_at: today,
      },
    ],
    logs: [
      {
        log_id: "log_001",
        workflow_name: "01 - Lead Intake and Qualification",
        trigger_event: "lead.created",
        entity_type: "lead",
        entity_id: "lead_001",
        action_taken: "Lead qualified and first email sent",
        status: "success",
        error_message: "",
        created_at: today,
      },
      {
        log_id: "log_002",
        workflow_name: "01 - Lead Intake and Qualification",
        trigger_event: "lead.created",
        entity_type: "lead",
        entity_id: "lead_002",
        action_taken: "Queued manual follow-up because consent is unknown",
        status: "queued",
        error_message: "",
        created_at: today,
      },
      {
        log_id: "log_003",
        workflow_name: "03 - Member Lifecycle and Retention",
        trigger_event: "schedule.daily",
        entity_type: "member",
        entity_id: "mem_003",
        action_taken: "Created high-risk retention task",
        status: "success",
        error_message: "",
        created_at: today,
      },
    ],
    settings: [
      {
        setting_name: "DEFAULT_ASSIGNEE",
        value: "Gym Owner",
        description: "Default owner for manual follow-up tasks.",
      },
      {
        setting_name: "REVIEW_COOLDOWN_DAYS",
        value: "90",
        description: "Minimum days before asking a member for another review.",
      },
      {
        setting_name: "RETENTION_HIGH_DAYS",
        value: "21",
        description: "Days inactive before a member becomes high risk.",
      },
    ],
  };
}

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  return String(value || "").toLowerCase() === "true" || String(value || "").toLowerCase() === "yes";
}

function createLead(input) {
  const now = new Date().toISOString();
  const score = Number(input.lead_score || 0) || estimateLeadScore(input);
  const temperature = input.lead_temperature || scoreToTemperature(score);

  return {
    lead_id: `lead_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
    name: clean(input.name),
    email: clean(input.email),
    phone: clean(input.phone),
    source: clean(input.source) || "website",
    original_message: clean(input.message || input.original_message),
    fitness_goal: clean(input.fitness_goal),
    interested_service: clean(input.interested_service) || "unknown",
    lead_temperature: temperature,
    lead_score: score,
    lifecycle_stage: "new",
    consent_status: clean(input.consent_status) || "unknown",
    preferred_channel: clean(input.preferred_channel) || "email",
    ai_summary: "Pending n8n qualification.",
    next_action: "Route through lead intake automation.",
    assigned_to: "Gym Owner",
    created_at: now,
    updated_at: now,
    last_contacted_at: "",
    opted_out: toBoolean(input.opted_out),
  };
}

function estimateLeadScore(input) {
  let score = 42;
  const message = String(input.message || input.original_message || "").toLowerCase();

  if (message.includes("trial") || message.includes("essai")) score += 24;
  if (message.includes("this week") || message.includes("cette semaine")) score += 12;
  if (input.email) score += 8;
  if (input.phone) score += 6;
  if (input.consent_status === "yes") score += 8;
  if (toBoolean(input.opted_out)) score -= 40;

  return Math.max(0, Math.min(100, score));
}

function scoreToTemperature(score) {
  if (score >= 75) return "hot";
  if (score >= 45) return "warm";
  return "cold";
}

function clean(value) {
  return String(value || "").trim();
}

function appendLead(state, lead, workerResult) {
  state.leads.unshift(lead);

  const now = new Date().toISOString();
  state.logs.unshift({
    log_id: `log_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
    workflow_name: workerResult?.forwarded
      ? "Cloudflare Worker -> n8n"
      : "Local Backend Intake",
    trigger_event: "lead.created",
    entity_type: "lead",
    entity_id: lead.lead_id,
    action_taken: workerResult?.forwarded
      ? "Lead submitted through Worker"
      : "Lead saved locally for demo mode",
    status: workerResult?.ok ? "success" : "queued",
    error_message: workerResult?.error || "",
    created_at: now,
  });

  if (lead.consent_status !== "yes" || lead.opted_out) {
    state.tasks.unshift({
      task_id: `task_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      owner: "Gym Owner",
      entity_type: "lead",
      entity_id: lead.lead_id,
      task_type: "follow_up",
      priority: "medium",
      due_at: now,
      status: "open",
      notes: "Manual review required before messaging this lead.",
      created_at: now,
    });
  }
}

function buildDashboard(state, config) {
  const leads = state.leads;
  const members = state.members;
  const tasks = state.tasks.filter((task) => task.status === "open");
  const logs = state.logs;
  const campaigns = state.campaigns;

  const pipeline = LEAD_STAGES.map((stage) => ({
    stage,
    label: titleize(stage),
    count: leads.filter((lead) => lead.lifecycle_stage === stage).length,
  }));

  const riskLevels = ["none", "low", "medium", "high", "renewal", "service"];
  const retention = riskLevels.map((risk) => ({
    risk,
    label: titleize(risk),
    count: members.filter((member) => member.retention_risk === risk).length,
  }));

  const todayKey = new Date().toISOString().slice(0, 10);

  return {
    summary: {
      leads_total: leads.length,
      hot_leads: leads.filter((lead) => lead.lead_temperature === "hot").length,
      active_members: members.filter((member) => member.status === "active").length,
      high_risk_members: members.filter((member) => member.retention_risk === "high").length,
      open_tasks: tasks.length,
      approval_needed: campaigns.filter((campaign) => campaign.status === "approval_needed").length,
      success_today: logs.filter(
        (log) => log.status === "success" && String(log.created_at).startsWith(todayKey)
      ).length,
      skipped_or_queued: logs.filter((log) => ["skipped", "queued"].includes(log.status)).length,
    },
    pipeline,
    retention,
    recent_logs: logs.slice(0, 8),
    priority_tasks: tasks
      .slice()
      .sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))
      .slice(0, 6),
    connection: config,
  };
}

function priorityRank(priority) {
  return { low: 1, medium: 2, high: 3 }[priority] || 0;
}

function titleize(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

module.exports = {
  loadState,
  saveState,
  createLead,
  appendLead,
  buildDashboard,
  titleize,
};
