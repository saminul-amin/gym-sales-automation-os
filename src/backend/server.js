const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const {
  loadState,
  saveState,
  createLead,
  appendLead,
  buildDashboard,
} = require("./data-store");

const ROOT = path.resolve(__dirname, "..", "..");

loadEnvFile(path.join(ROOT, ".env"));
loadEnvFile(path.join(ROOT, ".env.local"));

const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 4000);
const app = express();
let state = loadState();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: false,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (request, response) => {
  response.json({
    ok: true,
    service: "gym-sales-automation-os-express-api",
    time: new Date().toISOString(),
    connection: publicConnectionConfig(),
  });
});

app.get("/api/dashboard", (request, response) => {
  response.json(buildDashboard(state, publicConnectionConfig()));
});

app.get("/api/leads", (request, response) => {
  response.json(filterLeads(state.leads, request.query));
});

app.post("/api/leads", async (request, response) => {
  const error = validateLeadInput(request.body);

  if (error) {
    response.status(422).json({ error });
    return;
  }

  const lead = createLead(request.body);
  const workerResult = await maybeForwardLead(request.body);

  if (workerResult.forwarded && !workerResult.ok) {
    response.status(502).json({
      error: "Worker rejected lead",
      worker_status: workerResult.status,
      worker_response: workerResult.body,
      worker_error: workerResult.error || "",
    });
    return;
  }

  appendLead(state, lead, workerResult);
  saveState(state);

  response.status(201).json({
    ok: true,
    lead,
    worker: workerResult,
  });
});

app.get("/api/members", (request, response) => {
  response.json(state.members);
});

app.get("/api/tasks", (request, response) => {
  response.json(state.tasks);
});

app.post("/api/tasks/:taskId/complete", (request, response) => {
  const task = state.tasks.find((item) => item.task_id === request.params.taskId);

  if (!task) {
    response.status(404).json({ error: "Task not found" });
    return;
  }

  task.status = "done";
  task.completed_at = new Date().toISOString();
  saveState(state);
  response.json({ ok: true, task });
});

app.get("/api/campaigns", (request, response) => {
  response.json(state.campaigns);
});

app.post("/api/campaigns/:campaignId/decision", (request, response) => {
  const campaign = state.campaigns.find(
    (item) => item.campaign_id === request.params.campaignId
  );

  if (!campaign) {
    response.status(404).json({ error: "Campaign not found" });
    return;
  }

  const decision = request.body?.decision === "approve" ? "active" : "paused";
  campaign.status = decision;
  campaign.reviewed_at = new Date().toISOString();
  saveState(state);
  response.json({ ok: true, campaign });
});

app.get("/api/logs", (request, response) => {
  response.json(state.logs.slice(0, 100));
});

app.get("/api/settings", (request, response) => {
  response.json(state.settings);
});

app.use((request, response) => {
  response.status(404).json({ error: "API route not found" });
});

app.use((error, request, response, next) => {
  response.status(500).json({
    error: "Internal server error",
    message: error.message,
  });
});

app.listen(PORT, () => {
  const config = publicConnectionConfig();
  console.log(`Express API running at http://localhost:${PORT}`);
  console.log(`Worker proxy: ${config.worker_configured ? config.worker_base_url : "demo mode"}`);
});

function filterLeads(leads, query) {
  const search = String(query.q || "").toLowerCase();
  const stage = String(query.stage || "");
  const temp = String(query.temperature || "");

  return leads.filter((lead) => {
    const matchesSearch =
      !search ||
      [lead.name, lead.email, lead.phone, lead.original_message, lead.ai_summary]
        .join(" ")
        .toLowerCase()
        .includes(search);
    const matchesStage = !stage || lead.lifecycle_stage === stage;
    const matchesTemp = !temp || lead.lead_temperature === temp;
    return matchesSearch && matchesStage && matchesTemp;
  });
}

async function maybeForwardLead(input) {
  const config = privateConnectionConfig();

  if (!config.worker_configured) {
    return {
      forwarded: false,
      ok: true,
      mode: "demo_local",
    };
  }

  const target = `${config.worker_base_url.replace(/\/$/, "")}/lead`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const result = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PlugWheel-Secret": config.worker_secret,
      },
      body: JSON.stringify({
        event_type: "lead.created",
        source: input.source || "next_frontend",
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message || input.original_message || "",
        fitness_goal: input.fitness_goal || "",
        interested_service: input.interested_service || "unknown",
        preferred_channel: input.preferred_channel || "email",
        consent_status: input.consent_status || "unknown",
        opted_out: Boolean(input.opted_out),
      }),
      signal: controller.signal,
    });

    const body = await safeResponseBody(result);
    return {
      forwarded: true,
      ok: result.ok,
      status: result.status,
      body,
    };
  } catch (error) {
    return {
      forwarded: true,
      ok: false,
      status: 0,
      error: error.name === "AbortError" ? "Worker request timed out" : error.message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function safeResponseBody(result) {
  const text = await result.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function validateLeadInput(input) {
  if (!input || typeof input !== "object") {
    return "JSON body is required";
  }

  if (!String(input.name || "").trim()) {
    return "Lead name is required";
  }

  if (!String(input.email || "").trim() && !String(input.phone || "").trim()) {
    return "Email or phone is required";
  }

  const consent = String(input.consent_status || "unknown");
  if (!["yes", "no", "unknown"].includes(consent)) {
    return "consent_status must be yes, no, or unknown";
  }

  return "";
}

function publicConnectionConfig() {
  const privateConfig = privateConnectionConfig();
  return {
    worker_configured: privateConfig.worker_configured,
    worker_base_url: privateConfig.worker_base_url,
    mode: privateConfig.worker_configured ? "worker_proxy" : "demo_local",
  };
}

function privateConnectionConfig() {
  const workerBaseUrl =
    process.env.WORKER_BASE_URL ||
    process.env.CLOUDFLARE_WORKER_URL ||
    "";
  const workerSecret =
    process.env.WORKER_SHARED_SECRET ||
    process.env.WEBHOOK_SHARED_SECRET ||
    "";

  return {
    worker_configured: Boolean(workerBaseUrl && workerSecret),
    worker_base_url: workerBaseUrl,
    worker_secret: workerSecret,
  };
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
