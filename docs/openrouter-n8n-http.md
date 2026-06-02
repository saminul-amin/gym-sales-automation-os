# OpenRouter in the n8n HTTP Request Node

Use n8n's `HTTP Request` node to call OpenRouter's OpenAI-compatible chat completions endpoint.

## Node Settings

Node:

```text
HTTP Request
```

Configure:

| Setting | Value |
| --- | --- |
| Method | `POST` |
| URL | `https://openrouter.ai/api/v1/chat/completions` |
| Authentication | `None`, or use a Header Auth credential |
| Send Headers | `On` |
| Send Body | `On` |
| Body Content Type | `JSON` |
| Specify Body | `Using JSON` |
| Response Format | `JSON` |

## Headers

Add these headers:

| Name | Value |
| --- | --- |
| `Authorization` | `Bearer {{$env.OPENROUTER_API_KEY}}` |
| `Content-Type` | `application/json` |
| `HTTP-Referer` | `{{$env.APP_URL}}` |
| `X-OpenRouter-Title` | `Gym Sales Automation OS` |

If you prefer not to use environment variables, create an n8n `Header Auth` credential for OpenRouter and keep the API key out of workflow screenshots.

## Lead Qualification Body

Use this JSON body in the HTTP Request node. Map the system and user prompt text from the previous `Code` or `Set` node.

```json
{
  "model": "{{$env.OPENROUTER_MODEL}}",
  "messages": [
    {
      "role": "system",
      "content": "{{$json.ai_system_message}}"
    },
    {
      "role": "user",
      "content": "{{$json.ai_user_message}}"
    }
  ],
  "temperature": 0.2,
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "lead_qualification",
      "strict": true,
      "schema": {
        "type": "object",
        "additionalProperties": false,
        "required": [
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
        "properties": {
          "lead_temperature": { "type": "string", "enum": ["hot", "warm", "cold"] },
          "lead_score": { "type": "integer", "minimum": 0, "maximum": 100 },
          "intent": {
            "type": "string",
            "enum": [
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
          "interested_service": {
            "type": "string",
            "enum": ["membership", "personal_training", "pilates", "supplements", "premium_plan", "unknown"]
          },
          "fitness_goal": { "type": "string", "minLength": 0, "maxLength": 200 },
          "urgency": { "type": "string", "enum": ["today", "this_week", "this_month", "not_specified"] },
          "budget_sensitivity": { "type": "string", "enum": ["high", "medium", "low", "unknown"] },
          "preferred_channel": { "type": "string", "enum": ["email", "whatsapp", "sms", "call", "unknown"] },
          "summary": { "type": "string", "minLength": 1, "maxLength": 500 },
          "recommended_next_action": { "type": "string", "minLength": 1, "maxLength": 300 },
          "suggested_reply_fr": { "type": "string", "minLength": 1, "maxLength": 700 },
          "risk_flags": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "no_consent",
                "opted_out",
                "medical_advice_requested",
                "complaint",
                "price_sensitive",
                "manual_review_needed"
              ]
            },
            "uniqueItems": true
          },
          "automation_allowed": { "type": "boolean" }
        }
      }
    }
  }
}
```

## Parse the Response

OpenRouter returns the model content at:

```text
{{$json.choices[0].message.content}}
```

Add a `Code` node after the HTTP Request node:

```js
const content = $json.choices?.[0]?.message?.content;

if (!content) {
  throw new Error("OpenRouter response did not include message content");
}

const parsed = JSON.parse(content);

return [
  {
    json: {
      ...$input.first().json,
      ai: parsed,
      openrouter_usage: $json.usage || null,
    },
  },
];
```

Then map `ai.lead_temperature`, `ai.lead_score`, `ai.summary`, and the other structured fields into Google Sheets.

## Error Handling

For the HTTP Request node:

- Keep `Retry On Fail` enabled when appropriate.
- Use an error workflow with `Error Trigger` for production-style logging.
- During MVP testing, set `On Error` to stop the workflow so failures are visible.

If OpenRouter fails or JSON parsing fails:

1. Add an `Automation Logs` row with `status = failed`.
2. Create a high-priority `Tasks` row for manual review.
3. Do not send the outbound lead reply automatically.

