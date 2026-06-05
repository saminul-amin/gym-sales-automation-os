const ROUTES = {
  "/lead": "N8N_LEAD_WEBHOOK_URL",
  "/resamania": "N8N_RESAMANIA_WEBHOOK_URL",
  "/interaction": "N8N_INTERACTION_WEBHOOK_URL",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const url = new URL(request.url);
    const targetEnvKey = ROUTES[url.pathname];

    if (!targetEnvKey) {
      return json({ error: "Unknown route" }, 404);
    }

    const authError = validateSharedSecret(request, env);
    if (authError) {
      return authError;
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const normalized = normalizeEvent(url.pathname, payload);
    const validationError = validateEvent(normalized);

    if (validationError) {
      return json({ error: validationError, event_id: normalized.event_id }, 422);
    }

    const targetUrl = env[targetEnvKey];
    if (!targetUrl) {
      return json({ error: `Missing ${targetEnvKey}`, event_id: normalized.event_id }, 500);
    }

    const n8nResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Event-ID": normalized.event_id,
        "X-Event-Type": normalized.event_type,
        ...(env.N8N_OUTBOUND_TOKEN
          ? { Authorization: `Bearer ${env.N8N_OUTBOUND_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(normalized),
    });

    if (!n8nResponse.ok) {
      return json(
        {
          error: "n8n webhook rejected event",
          event_id: normalized.event_id,
          status: n8nResponse.status,
        },
        502
      );
    }

    return json(
      {
        ok: true,
        event_id: normalized.event_id,
        event_type: normalized.event_type,
      },
      202
    );
  },
};

function validateSharedSecret(request, env) {
  if (!env.WEBHOOK_SHARED_SECRET) {
    return null;
  }

  const provided = request.headers.get("x-plugwheel-secret");
  if (provided !== env.WEBHOOK_SHARED_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }

  return null;
}

function normalizeEvent(pathname, payload) {
  const now = new Date().toISOString();
  const eventId = payload.event_id || crypto.randomUUID();

  if (pathname === "/lead") {
    return {
      event_id: eventId,
      event_type: payload.event_type || "lead.created",
      received_at: now,
      source: payload.source || "unknown",
      lead: {
        name: payload.name || payload.lead?.name || "",
        email: payload.email || payload.lead?.email || "",
        phone: payload.phone || payload.lead?.phone || "",
        original_message: payload.message || payload.original_message || payload.lead?.original_message || "",
        fitness_goal: payload.fitness_goal || payload.lead?.fitness_goal || "",
        interested_service: payload.interested_service || payload.lead?.interested_service || "unknown",
        preferred_channel: payload.preferred_channel || payload.lead?.preferred_channel || "email",
        consent_status: payload.consent_status || payload.lead?.consent_status || "unknown",
        opted_out: Boolean(payload.opted_out || payload.lead?.opted_out || false),
      },
      raw: payload,
    };
  }

  if (pathname === "/resamania") {
    return {
      event_id: eventId,
      event_type: payload.event_type || "resamania.mock_event",
      received_at: now,
      source: "resamania_mock",
      resamania: payload.resamania || payload,
      raw: payload,
    };
  }

  return {
    event_id: eventId,
    event_type: payload.event_type || "interaction.created",
    received_at: now,
    source: payload.source || "manual",
    interaction: payload.interaction || payload,
    raw: payload,
  };
}

function validateEvent(event) {
  if (event.event_type === "lead.created") {
    const lead = event.lead || {};
    if (!lead.name) {
      return "Lead name is required";
    }
    if (!lead.email && !lead.phone) {
      return "Lead email or phone is required";
    }
    if (!["yes", "no", "unknown"].includes(lead.consent_status)) {
      return "consent_status must be yes, no, or unknown";
    }
  }

  return null;
}

function json(body, status = 200) {
  return withCors(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, X-PlugWheel-Secret");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
