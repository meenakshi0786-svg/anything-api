# API for Anything — Complete Platform Architecture

> Turn any website workflow into a callable API using AI agents.
> Describe it. We build it. You call it.

---

## 1. SYSTEM ARCHITECTURE

```
                          API FOR ANYTHING — SYSTEM OVERVIEW
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                           CLIENT LAYER                                      │
 │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
 │  │ Web App  │  │ Studio   │  │ REST API │  │ SDK      │  │ CLI      │     │
 │  │Dashboard │  │ Builder  │  │ Gateway  │  │ JS/Python│  │ Tool     │     │
 │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
 └───────┼──────────────┼────────────┼──────────────┼──────────────┼───────────┘
         │              │            │              │              │
 ┌───────▼──────────────▼────────────▼──────────────▼──────────────▼───────────┐
 │                         API GATEWAY (Kong / Traefik)                         │
 │          Rate limiting · Auth (JWT/API Key) · Routing · Metering            │
 └───────────────────────────────┬─────────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
 ┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
 │  WORKFLOW SVC │     │  EXECUTION SVC  │     │  STUDIO SVC     │
 │               │     │                 │     │                 │
 │ CRUD workflows│     │ Run workflows   │     │ Chat interface  │
 │ Version mgmt  │     │ Queue + workers │     │ Visual builder  │
 │ Schema infer  │     │ Result storage  │     │ NL → workflow   │
 │ API endpoint  │     │ Retry logic     │     │ Step debugger   │
 │ generation    │     │ Webhooks        │     │                 │
 └───────┬───────┘     └────────┬────────┘     └────────┬────────┘
         │                      │                       │
         ▼                      ▼                       ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │                        AI ORCHESTRATION LAYER                    │
 │                                                                  │
 │  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐  │
 │  │   PLANNER    │  │   EXECUTOR    │  │   SELF-HEALER        │  │
 │  │              │  │               │  │                      │  │
 │  │ NL → DAG     │  │ Step-by-step  │  │ Detect failures      │  │
 │  │ Intent parse │  │ LLM decisions │  │ Re-plan broken steps │  │
 │  │ Schema gen   │  │ Action replay │  │ Selector migration   │  │
 │  │ Step optimize│  │ Data extract  │  │ Layout adaptation    │  │
 │  └──────────────┘  └───────────────┘  └──────────────────────┘  │
 │                                                                  │
 │  ┌──────────────────────────────────────────────────────────┐   │
 │  │                    AGENT MEMORY STORE                     │   │
 │  │  Past executions · Learned selectors · Site fingerprints  │   │
 │  └──────────────────────────────────────────────────────────┘   │
 └──────────────────────────────┬──────────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────────┐
 │                     BROWSER INFRASTRUCTURE                       │
 │                                                                  │
 │  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐  │
 │  │ BROWSER POOL │  │ PROXY LAYER   │  │ SESSION MANAGER      │  │
 │  │              │  │               │  │                      │  │
 │  │ Playwright   │  │ Residential   │  │ Cookie persistence   │  │
 │  │ sessions     │  │ Datacenter    │  │ Login state          │  │
 │  │ Auto-scaling │  │ Rotation      │  │ Browser profiles     │  │
 │  │ Edge deploy  │  │ Geo-targeting │  │ Credential vault     │  │
 │  │ 1000+ conc.  │  │ Fingerprint   │  │ 2FA / OTP handling   │  │
 │  └──────────────┘  └───────────────┘  └──────────────────────┘  │
 │                                                                  │
 │  ┌──────────────────────────────────────────────────────────┐   │
 │  │                  ANTI-DETECTION ENGINE                    │   │
 │  │  Canvas spoof · WebGL noise · TLS fingerprint rotation    │   │
 │  │  Human-like mouse/keyboard · CAPTCHA solving pipeline     │   │
 │  └──────────────────────────────────────────────────────────┘   │
 └──────────────────────────────┬──────────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────────┐
 │                         DATA LAYER                               │
 │                                                                  │
 │  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌────────────────┐  │
 │  │ PostgreSQL │ │ Redis      │ │ S3/R2    │ │ ClickHouse     │  │
 │  │            │ │            │ │          │ │                │  │
 │  │ Workflows  │ │ Queue      │ │ Results  │ │ Execution logs │  │
 │  │ Users      │ │ Sessions   │ │ Exports  │ │ Analytics      │  │
 │  │ API keys   │ │ Rate limit │ │ Replays  │ │ Metering       │  │
 │  │ Billing    │ │ Cache      │ │ Snapshots│ │ Observability  │  │
 │  └────────────┘ └────────────┘ └──────────┘ └────────────────┘  │
 └─────────────────────────────────────────────────────────────────┘
```

---

## 2. DETAILED COMPONENT BREAKDOWN

### 2.1 API Gateway

| Concern | Implementation |
|---|---|
| Authentication | JWT tokens (dashboard), API keys (programmatic) |
| Rate limiting | Token bucket per API key, configurable per plan |
| Routing | `/v1/workflows/*`, `/v1/runs/*`, `/v1/studio/*` |
| Metering | Every request logged to ClickHouse for billing |
| WebSocket | Live execution streams, studio chat |

### 2.2 Workflow Service

The core service that manages workflow definitions.

**Workflow Lifecycle:**
```
User Prompt → Planner (AI) → Execution Graph (DAG) → Validation → Store → Generate API Endpoint
```

**Workflow = a versioned, executable DAG:**
```json
{
  "id": "wf_abc123",
  "version": 3,
  "name": "Amazon Product Scraper",
  "description": "Extract price, title, reviews from Amazon product URL",
  "input_schema": {
    "type": "object",
    "properties": {
      "url": { "type": "string", "format": "uri", "description": "Amazon product URL" }
    },
    "required": ["url"]
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "price": { "type": "number" },
      "currency": { "type": "string" },
      "rating": { "type": "number" },
      "review_count": { "type": "integer" },
      "reviews": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "author": { "type": "string" },
            "rating": { "type": "number" },
            "text": { "type": "string" }
          }
        }
      }
    }
  },
  "steps": [
    {
      "id": "step_1",
      "type": "navigate",
      "config": { "url": "{{input.url}}" },
      "timeout_ms": 15000,
      "retry": { "max": 2, "backoff": "exponential" }
    },
    {
      "id": "step_2",
      "type": "wait_for",
      "config": { "selector": "#productTitle", "fallback": "ai" },
      "depends_on": ["step_1"]
    },
    {
      "id": "step_3",
      "type": "extract",
      "config": {
        "strategy": "hybrid",
        "selectors": {
          "title": "#productTitle",
          "price": ".a-price-whole"
        },
        "ai_fallback": true,
        "ai_prompt": "Extract the product title, price, rating, and review count from this page"
      },
      "depends_on": ["step_2"]
    },
    {
      "id": "step_4",
      "type": "paginate",
      "config": {
        "target": "reviews",
        "next_selector": "#reviews-pagination .a-last a",
        "max_pages": 3,
        "extract_per_page": {
          "strategy": "ai",
          "prompt": "Extract all reviews with author, rating, and text"
        }
      },
      "depends_on": ["step_3"]
    }
  ],
  "settings": {
    "proxy": "residential",
    "geo": "us",
    "browser_profile": "default",
    "max_runtime_ms": 60000,
    "cache_ttl_s": 3600
  }
}
```

**Step Types:**
| Type | Description |
|---|---|
| `navigate` | Go to URL |
| `click` | Click element (selector or AI-located) |
| `type_text` | Type into input field |
| `wait_for` | Wait for element/condition |
| `extract` | Pull data from page (selector/AI/hybrid) |
| `screenshot` | Capture page state |
| `paginate` | Loop through pages |
| `scroll` | Scroll to load content |
| `condition` | If/else branching |
| `loop` | Iterate over list of items |
| `auth` | Login flow (uses credential vault) |
| `api_call` | Call external API mid-workflow |
| `transform` | Map/filter/reshape extracted data |
| `ai_decide` | LLM makes a runtime decision |

### 2.3 Execution Service

**Architecture:**
```
                    ┌─────────────┐
                    │  API Request │
                    │  POST /run   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   QUEUE     │
                    │  (BullMQ/   │
                    │   Redis)    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Worker 1 │ │ Worker 2 │ │ Worker N │
        │          │ │          │ │          │
        │ Browser  │ │ Browser  │ │ Browser  │
        │ Session  │ │ Session  │ │ Session  │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │             │             │
             ▼             ▼             ▼
        ┌──────────────────────────────────────┐
        │         RESULT AGGREGATOR            │
        │  Validate against output_schema      │
        │  Cache result · Store in S3          │
        │  Return JSON to caller               │
        └──────────────────────────────────────┘
```

**Execution Modes:**
| Mode | Description | Use Case |
|---|---|---|
| `sync` | Blocks until complete, returns JSON | Simple scrapes < 30s |
| `async` | Returns run_id, poll or webhook for result | Complex workflows |
| `stream` | SSE stream of step-by-step progress | Studio debugging |
| `batch` | Submit array of inputs, parallel execution | Bulk scraping |
| `scheduled` | Cron-based recurring execution | Monitoring, feeds |

**Run Lifecycle:**
```
QUEUED → STARTING → RUNNING → [step_1 → step_2 → ... → step_N] → COMPLETED
                                    │                                   │
                                    ▼                                   ▼
                                STEP_FAILED → RETRYING → ...       DELIVERING
                                    │                                   │
                                    ▼                                   ▼
                                RUN_FAILED                          DELIVERED
```

### 2.4 AI Orchestration Layer

#### Planner

Takes natural language → produces an execution DAG.

```
Input: "Log into my LinkedIn, search for 'AI engineer' jobs in San Francisco,
        and extract the first 20 results with title, company, salary, and link"

Planner Output:
  Step 1: auth(linkedin, vault_key="user_linkedin_creds")
  Step 2: navigate("https://linkedin.com/jobs")
  Step 3: type_text(selector=".jobs-search-box input", text="AI engineer")
  Step 4: type_text(selector=".jobs-search-box__location input", text="San Francisco")
  Step 5: click(selector=".jobs-search-box__submit-button")
  Step 6: wait_for(selector=".jobs-search-results")
  Step 7: extract_loop(
            items=".job-card-container",
            max=20,
            fields={title, company, salary, link},
            strategy="hybrid"
          )
  Step 8: transform(normalize_salary, deduplicate)

  Input Schema:  { search_query: string, location: string }
  Output Schema: { jobs: [{ title, company, salary, link }] }
```

**Planner Architecture:**
- Model: Claude Sonnet 4.6 (fast, accurate structured output)
- System prompt with 50+ site-specific heuristics
- Few-shot examples for common patterns (e-commerce, social, job boards)
- Iterative refinement: plan → dry-run validate → fix → finalize

#### Executor

The runtime AI that makes decisions during execution.

**Responsibilities:**
- Resolve ambiguous selectors ("the main price, not the strikethrough one")
- Handle popups, cookie banners, modals dynamically
- Adapt to A/B test variants of pages
- Decide scroll depth for infinite scroll pages
- Parse unstructured text into structured fields

**Executor uses a ReAct loop:**
```
OBSERVE (page state + DOM snapshot) → THINK (what to do next) → ACT (browser action) → loop
```

#### Self-Healer

Monitors workflow executions and automatically repairs broken workflows.

```
Trigger: Workflow step fails with selector-not-found or unexpected-page-state

Self-Healer Process:
  1. Take screenshot of current page
  2. Compare with last successful execution screenshot
  3. Identify what changed (layout shift, redesign, A/B test)
  4. Use AI to find new selector / new interaction pattern
  5. Test the fix
  6. If successful: update workflow step, bump version, notify user
  7. If failed: flag for human review
```

**Agent Memory Store:**
- Stores learned selectors per domain
- Caches site fingerprints (which anti-bot, which framework)
- Remembers successful strategies per site category
- Shares learnings across all users (anonymized)

### 2.5 Browser Infrastructure

**Browser Pool Manager:**
```
┌────────────────────────────────────────────────┐
│              BROWSER POOL MANAGER               │
│                                                 │
│  Pool Config:                                   │
│    min_idle: 10        max_concurrent: 1000     │
│    session_ttl: 300s   recycle_after: 50 runs   │
│                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ Region: │ │ Region: │ │ Region: │  ...      │
│  │ US-EAST │ │ EU-WEST │ │ AP-SE   │          │
│  │         │ │         │ │         │          │
│  │ 200 inst│ │ 150 inst│ │ 100 inst│          │
│  │ Playwright│ Playwright│ Playwright│          │
│  │ Chromium │ │ Chromium │ │ Chromium │          │
│  └─────────┘ └─────────┘ └─────────┘          │
│                                                 │
│  Auto-scaling: Kubernetes HPA on queue depth    │
│  Health checks: every 10s per instance          │
│  Warm pool: pre-launched browsers ready to use  │
└────────────────────────────────────────────────┘
```

**Anti-Detection Stack:**
| Technique | Implementation |
|---|---|
| Browser fingerprint | Randomized canvas, WebGL, fonts per session |
| TLS fingerprint | JA3 rotation via custom TLS config |
| Mouse movement | Bezier curve humanized movements |
| Typing | Variable keystroke timing (50-200ms) |
| Viewport | Randomized realistic screen sizes |
| Timezone/locale | Matched to proxy geo |
| CAPTCHA solving | hCaptcha/reCAPTCHA via 2captcha + AI fallback |
| Cookie consent | Auto-dismiss via common pattern DB |

**Credential Vault:**
- AES-256-GCM encryption at rest
- Scoped access: credentials only decrypted inside browser session
- Support for OAuth flows, username/password, API tokens
- OTP interception via virtual phone numbers
- Auto-rotation alerts for expiring credentials

### 2.6 Studio Service

#### Chat-based Studio

```
┌────────────────────────────────────────────────────────────────┐
│  STUDIO CHAT                                                    │
│                                                                 │
│  User: "I want to monitor competitor prices on Shopify stores"  │
│                                                                 │
│  AI: I'll build a workflow for that. Let me clarify:            │
│      1. How many competitor URLs do you want to monitor?        │
│      2. What data do you need? (price, stock, variants?)        │
│      3. How often should it run?                                │
│                                                                 │
│  User: "5 URLs, just price and stock status, every 6 hours"    │
│                                                                 │
│  AI: Here's the workflow I've designed:                         │
│      ┌──────────┐   ┌──────────┐   ┌──────────┐               │
│      │ Navigate │──▶│ Extract  │──▶│ Compare  │               │
│      │ to URL   │   │ price +  │   │ with last│               │
│      └──────────┘   │ stock    │   │ run data │               │
│                     └──────────┘   └──────────┘               │
│      Input: { urls: string[] }                                  │
│      Output: { products: [{ url, price, stock, changed }] }    │
│                                                                 │
│      Shall I:                                                   │
│      a) Test it now with one URL?                               │
│      b) Deploy as API + set up 6hr schedule?                    │
│      c) Modify the workflow?                                    │
│                                                                 │
│  User: "Test it first with https://example-store.com"           │
│                                                                 │
│  AI: Running... [live execution stream with screenshots]        │
│      ✓ Navigated to page (1.2s)                                │
│      ✓ Extracted: price=$29.99, stock=in_stock (0.8s)          │
│      Total: 2.0s                                                │
│                                                                 │
│      Result: { "price": 29.99, "stock": "in_stock" }           │
│      Looks good? Ready to deploy?                               │
│                                                                 │
│  User: "Also extract the product image URL"                     │
│                                                                 │
│  AI: Updated. Added image extraction step.                      │
│      [shows updated DAG with new field]                         │
│      Re-running test...                                         │
└────────────────────────────────────────────────────────────────┘
```

#### Visual Workflow Builder

Node-based editor (React Flow):
```
┌──────────────────────────────────────────────────────────┐
│  VISUAL BUILDER                                  [Deploy]│
│                                                          │
│  ┌──────────┐     ┌───────────┐     ┌──────────┐       │
│  │ TRIGGER  │────▶│ OPEN PAGE │────▶│ WAIT FOR │       │
│  │ API Call │     │ {{url}}   │     │ .product │       │
│  └──────────┘     └───────────┘     └────┬─────┘       │
│                                          │              │
│                                    ┌─────▼──────┐       │
│                                    │  EXTRACT   │       │
│                                    │ title,price│       │
│                                    │ rating     │       │
│                                    └─────┬──────┘       │
│                                          │              │
│                            ┌─────────────┼──────┐       │
│                            ▼             ▼      │       │
│                     ┌──────────┐  ┌──────────┐  │       │
│                     │ LOOP     │  │ CONDITION│  │       │
│                     │ Reviews  │  │ Has next │──┘       │
│                     │ page 1-3 │  │ page?    │          │
│                     └─────┬────┘  └──────────┘          │
│                           ▼                              │
│                     ┌──────────┐                         │
│                     │ OUTPUT   │                         │
│                     │ JSON     │                         │
│                     └──────────┘                         │
│                                                          │
│  [Node Inspector]  [Test Run]  [Execution Log]          │
└──────────────────────────────────────────────────────────┘
```

---

## 3. DATABASE SCHEMA

### Core Tables

```sql
-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT UNIQUE NOT NULL,
    name            TEXT,
    password_hash   TEXT,                         -- null if OAuth-only
    avatar_url      TEXT,
    plan            TEXT NOT NULL DEFAULT 'free', -- free | pro | team | enterprise
    stripe_customer_id TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    owner_id        UUID NOT NULL REFERENCES users(id),
    plan            TEXT NOT NULL DEFAULT 'team',
    stripe_subscription_id TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE team_members (
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'member', -- owner | admin | member | viewer
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (team_id, user_id)
);

CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id         UUID REFERENCES teams(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    key_hash        TEXT UNIQUE NOT NULL,          -- SHA-256 of the key
    key_prefix      TEXT NOT NULL,                 -- first 8 chars for display: "afa_1234..."
    scopes          TEXT[] NOT NULL DEFAULT '{"*"}',
    rate_limit_rpm  INTEGER NOT NULL DEFAULT 60,
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- WORKFLOWS
-- ============================================================

CREATE TABLE workflows (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    team_id         UUID REFERENCES teams(id),
    slug            TEXT NOT NULL,                  -- URL-safe name: "amazon-product-scraper"
    name            TEXT NOT NULL,
    description     TEXT,
    current_version INTEGER NOT NULL DEFAULT 1,
    input_schema    JSONB NOT NULL,                -- JSON Schema for API input
    output_schema   JSONB NOT NULL,                -- JSON Schema for API output
    settings        JSONB NOT NULL DEFAULT '{}',   -- proxy, geo, timeout, cache
    is_public       BOOLEAN NOT NULL DEFAULT false, -- listed in marketplace
    is_active       BOOLEAN NOT NULL DEFAULT true,
    tags            TEXT[] DEFAULT '{}',
    category        TEXT,                           -- e-commerce, social, jobs, etc.
    usage_count     BIGINT NOT NULL DEFAULT 0,
    avg_runtime_ms  INTEGER,
    success_rate    NUMERIC(5,2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, slug)
);

CREATE TABLE workflow_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    version         INTEGER NOT NULL,
    steps           JSONB NOT NULL,                -- DAG of execution steps
    input_schema    JSONB NOT NULL,
    output_schema   JSONB NOT NULL,
    changelog       TEXT,
    created_by      TEXT NOT NULL DEFAULT 'user',  -- user | self-healer | studio
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(workflow_id, version)
);

CREATE TABLE workflow_steps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_version_id UUID NOT NULL REFERENCES workflow_versions(id) ON DELETE CASCADE,
    step_index      INTEGER NOT NULL,
    step_id         TEXT NOT NULL,                  -- user-facing ID: "step_1"
    type            TEXT NOT NULL,                  -- navigate, click, extract, etc.
    config          JSONB NOT NULL,
    depends_on      TEXT[] DEFAULT '{}',            -- step_ids this depends on
    timeout_ms      INTEGER DEFAULT 15000,
    retry_config    JSONB DEFAULT '{"max": 2, "backoff": "exponential"}'
);

-- ============================================================
-- EXECUTIONS (RUNS)
-- ============================================================

CREATE TABLE runs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id     UUID NOT NULL REFERENCES workflows(id),
    workflow_version INTEGER NOT NULL,
    user_id         UUID NOT NULL REFERENCES users(id),
    api_key_id      UUID REFERENCES api_keys(id),
    status          TEXT NOT NULL DEFAULT 'queued',  -- queued|starting|running|completed|failed|cancelled
    mode            TEXT NOT NULL DEFAULT 'sync',    -- sync|async|batch|scheduled
    input           JSONB NOT NULL,
    output          JSONB,                           -- final structured result
    error           JSONB,                           -- {code, message, step_id, screenshot_url}
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    runtime_ms      INTEGER,
    browser_ms      INTEGER,                         -- billable browser time
    proxy_bytes     BIGINT DEFAULT 0,                -- billable proxy usage
    step_count      INTEGER,
    retry_count     INTEGER DEFAULT 0,
    cache_hit       BOOLEAN DEFAULT false,
    region          TEXT,                             -- execution region
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_runs_workflow ON runs(workflow_id, created_at DESC);
CREATE INDEX idx_runs_user ON runs(user_id, created_at DESC);
CREATE INDEX idx_runs_status ON runs(status) WHERE status IN ('queued', 'running');

CREATE TABLE run_steps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id          UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    step_id         TEXT NOT NULL,
    status          TEXT NOT NULL,                   -- pending|running|completed|failed|skipped
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    runtime_ms      INTEGER,
    input           JSONB,
    output          JSONB,
    error           JSONB,
    screenshot_url  TEXT,                            -- S3 URL of page state
    dom_snapshot    TEXT,                            -- compressed DOM at this step
    ai_reasoning    TEXT                             -- LLM thought process if AI step
);

CREATE TABLE run_logs (
    id              BIGSERIAL PRIMARY KEY,
    run_id          UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    step_id         TEXT,
    level           TEXT NOT NULL DEFAULT 'info',    -- debug|info|warn|error
    message         TEXT NOT NULL,
    metadata        JSONB,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SCHEDULING
-- ============================================================

CREATE TABLE schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id),
    cron_expression TEXT NOT NULL,                    -- "0 */6 * * *"
    timezone        TEXT NOT NULL DEFAULT 'UTC',
    input           JSONB NOT NULL,                  -- fixed input for scheduled runs
    is_active       BOOLEAN NOT NULL DEFAULT true,
    webhook_url     TEXT,                            -- deliver results here
    last_run_at     TIMESTAMPTZ,
    next_run_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CREDENTIALS & SESSIONS
-- ============================================================

CREATE TABLE credential_vaults (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,                    -- "my-linkedin-login"
    type            TEXT NOT NULL,                    -- password | oauth | api_token | cookie
    encrypted_data  BYTEA NOT NULL,                  -- AES-256-GCM encrypted
    domain          TEXT,                            -- "linkedin.com"
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE browser_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    cookies         BYTEA,                           -- encrypted
    local_storage   BYTEA,                           -- encrypted
    user_agent      TEXT,
    viewport        JSONB,
    fingerprint     JSONB,                           -- canvas, webgl, fonts config
    last_used_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AGENT MEMORY
-- ============================================================

CREATE TABLE agent_memory (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain          TEXT NOT NULL,                    -- "amazon.com"
    page_pattern    TEXT,                            -- "/dp/*" (URL pattern)
    memory_type     TEXT NOT NULL,                    -- selector|strategy|anti_bot|layout
    key             TEXT NOT NULL,                    -- "product_title_selector"
    value           JSONB NOT NULL,                  -- learned data
    confidence      NUMERIC(3,2) NOT NULL DEFAULT 1.0,
    hit_count       INTEGER NOT NULL DEFAULT 1,
    last_verified   TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(domain, page_pattern, memory_type, key)
);

-- ============================================================
-- MARKETPLACE
-- ============================================================

CREATE TABLE marketplace_listings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id     UUID NOT NULL REFERENCES workflows(id),
    author_id       UUID NOT NULL REFERENCES users(id),
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    long_description TEXT,
    icon_url        TEXT,
    category        TEXT NOT NULL,
    tags            TEXT[] DEFAULT '{}',
    price_per_run   NUMERIC(10,4),                   -- null = free
    install_count   BIGINT NOT NULL DEFAULT 0,
    avg_rating      NUMERIC(3,2),
    is_featured     BOOLEAN DEFAULT false,
    is_verified     BOOLEAN DEFAULT false,            -- team-reviewed
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE marketplace_reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id      UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id),
    rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(listing_id, user_id)
);

CREATE TABLE marketplace_installs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id      UUID NOT NULL REFERENCES marketplace_listings(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    forked_workflow_id UUID REFERENCES workflows(id),
    installed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(listing_id, user_id)
);

-- ============================================================
-- BILLING & METERING (ClickHouse for analytics, PG for state)
-- ============================================================

CREATE TABLE usage_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    team_id         UUID REFERENCES teams(id),
    run_id          UUID REFERENCES runs(id),
    metric          TEXT NOT NULL,                    -- browser_ms | proxy_bytes | run_count | ai_tokens
    quantity        BIGINT NOT NULL,
    unit_price      NUMERIC(10,6),                   -- price per unit at time of usage
    period_start    DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    team_id         UUID REFERENCES teams(id),
    stripe_invoice_id TEXT,
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    subtotal        NUMERIC(10,2) NOT NULL,
    tax             NUMERIC(10,2) DEFAULT 0,
    total           NUMERIC(10,2) NOT NULL,
    status          TEXT NOT NULL DEFAULT 'draft',    -- draft | pending | paid | failed
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 4. API DESIGN

### Base URL: `https://api.anythingapi.com/v1`

### Authentication
```
Authorization: Bearer afa_sk_live_xxxxxxxxxxxxx
```

### 4.1 Workflows

```
POST   /v1/workflows                    Create workflow (from NL prompt or step definition)
GET    /v1/workflows                    List user's workflows
GET    /v1/workflows/:id                Get workflow details
PUT    /v1/workflows/:id                Update workflow
DELETE /v1/workflows/:id                Delete workflow
GET    /v1/workflows/:id/versions       List versions
GET    /v1/workflows/:id/versions/:v    Get specific version
POST   /v1/workflows/:id/publish        Publish to marketplace
```

**Create Workflow (from natural language):**
```bash
curl -X POST https://api.anythingapi.com/v1/workflows \
  -H "Authorization: Bearer afa_sk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "ai",
    "prompt": "Get product price, title, and reviews from any Amazon URL",
    "test_input": {
      "url": "https://amazon.com/dp/B09V3KXJPB"
    }
  }'
```

**Response:**
```json
{
  "id": "wf_abc123",
  "slug": "amazon-product-scraper",
  "name": "Amazon Product Scraper",
  "status": "ready",
  "version": 1,
  "endpoint": "https://api.anythingapi.com/v1/run/amazon-product-scraper",
  "input_schema": {
    "type": "object",
    "properties": {
      "url": { "type": "string", "format": "uri" }
    },
    "required": ["url"]
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "price": { "type": "number" },
      "currency": { "type": "string" },
      "rating": { "type": "number" },
      "review_count": { "type": "integer" },
      "reviews": { "type": "array" }
    }
  },
  "steps_count": 4,
  "test_result": {
    "status": "success",
    "runtime_ms": 3200,
    "output": {
      "title": "Apple AirPods Pro (2nd Generation)",
      "price": 189.99,
      "currency": "USD",
      "rating": 4.7,
      "review_count": 89432,
      "reviews": [...]
    }
  }
}
```

### 4.2 Runs (Execute Workflows)

```
POST   /v1/run/:workflow_slug           Run workflow (sync)
POST   /v1/runs                         Run workflow (async)
GET    /v1/runs/:id                     Get run status + result
GET    /v1/runs/:id/steps               Get step-by-step detail
GET    /v1/runs/:id/logs                Get execution logs
GET    /v1/runs/:id/replay              Get session replay URL
POST   /v1/runs/:id/cancel              Cancel running execution
POST   /v1/runs/batch                   Batch run (multiple inputs)
```

**Sync Run (simplest usage):**
```bash
curl -X POST https://api.anythingapi.com/v1/run/amazon-product-scraper \
  -H "Authorization: Bearer afa_sk_live_xxx" \
  -d '{"url": "https://amazon.com/dp/B09V3KXJPB"}'
```

**Response (direct JSON):**
```json
{
  "title": "Apple AirPods Pro (2nd Generation)",
  "price": 189.99,
  "currency": "USD",
  "rating": 4.7,
  "review_count": 89432,
  "reviews": [
    { "author": "John D.", "rating": 5, "text": "Best earbuds I've ever owned..." },
    { "author": "Sarah M.", "rating": 4, "text": "Great sound quality but..." }
  ],
  "_meta": {
    "run_id": "run_xyz789",
    "runtime_ms": 3200,
    "cached": false,
    "version": 1
  }
}
```

**Async Run:**
```bash
curl -X POST https://api.anythingapi.com/v1/runs \
  -H "Authorization: Bearer afa_sk_live_xxx" \
  -d '{
    "workflow_id": "wf_abc123",
    "input": {"url": "https://amazon.com/dp/B09V3KXJPB"},
    "mode": "async",
    "webhook_url": "https://yourapp.com/webhook/scrape-result"
  }'
```

**Response:**
```json
{
  "run_id": "run_xyz789",
  "status": "queued",
  "poll_url": "https://api.anythingapi.com/v1/runs/run_xyz789",
  "estimated_runtime_ms": 3500
}
```

**Batch Run:**
```bash
curl -X POST https://api.anythingapi.com/v1/runs/batch \
  -H "Authorization: Bearer afa_sk_live_xxx" \
  -d '{
    "workflow_id": "wf_abc123",
    "inputs": [
      {"url": "https://amazon.com/dp/B09V3KXJPB"},
      {"url": "https://amazon.com/dp/B0BSHF7WHW"},
      {"url": "https://amazon.com/dp/B0D1XD1ZV3"}
    ],
    "concurrency": 3,
    "webhook_url": "https://yourapp.com/webhook/batch-result"
  }'
```

### 4.3 Schedules

```
POST   /v1/schedules                    Create schedule
GET    /v1/schedules                    List schedules
PUT    /v1/schedules/:id                Update schedule
DELETE /v1/schedules/:id                Delete schedule
POST   /v1/schedules/:id/trigger        Manually trigger
GET    /v1/schedules/:id/history        Past executions
```

**Create Schedule:**
```bash
curl -X POST https://api.anythingapi.com/v1/schedules \
  -H "Authorization: Bearer afa_sk_live_xxx" \
  -d '{
    "workflow_id": "wf_abc123",
    "cron": "0 */6 * * *",
    "timezone": "America/New_York",
    "input": {"url": "https://amazon.com/dp/B09V3KXJPB"},
    "webhook_url": "https://yourapp.com/webhook/price-update"
  }'
```

### 4.4 Studio

```
POST   /v1/studio/sessions              Start studio chat session
POST   /v1/studio/sessions/:id/message  Send message (returns SSE stream)
GET    /v1/studio/sessions/:id          Get session history
POST   /v1/studio/sessions/:id/deploy   Deploy current workflow
POST   /v1/studio/sessions/:id/test     Test current workflow
```

### 4.5 Marketplace

```
GET    /v1/marketplace                   Browse workflows
GET    /v1/marketplace/:id               Get listing details
POST   /v1/marketplace/:id/install       Install (fork) workflow
GET    /v1/marketplace/categories        List categories
GET    /v1/marketplace/featured          Featured workflows
```

### 4.6 Credentials

```
POST   /v1/credentials                  Store credential
GET    /v1/credentials                  List credentials (metadata only)
DELETE /v1/credentials/:id              Delete credential
POST   /v1/credentials/:id/test         Test credential (attempt login)
```

### 4.7 Browser Sessions (Direct Access)

```
POST   /v1/sessions                     Create browser session
GET    /v1/sessions/:id                 Get session info + live view URL
DELETE /v1/sessions/:id                 Close session
POST   /v1/sessions/:id/action          Execute action in session
GET    /v1/sessions/:id/screenshot      Take screenshot
```

---

## 5. SDK DESIGN

### Python SDK

```python
from anythingapi import AnythingAPI

client = AnythingAPI(api_key="afa_sk_live_xxx")

# ---- Create workflow from natural language ----
workflow = client.workflows.create(
    prompt="Get product price and reviews from any Amazon URL",
    test_input={"url": "https://amazon.com/dp/B09V3KXJPB"}
)
print(workflow.endpoint)        # https://api.anythingapi.com/v1/run/amazon-product-scraper
print(workflow.output_schema)   # auto-inferred JSON schema

# ---- Run workflow (sync, simplest) ----
result = client.run("amazon-product-scraper", url="https://amazon.com/dp/B09V3KXJPB")
print(result.title)             # "Apple AirPods Pro (2nd Generation)"
print(result.price)             # 189.99
print(result.reviews[0].text)   # "Best earbuds I've ever owned..."

# ---- Run workflow (async) ----
run = client.runs.create(
    workflow="amazon-product-scraper",
    input={"url": "https://amazon.com/dp/B09V3KXJPB"},
    mode="async"
)
run.wait()                      # polls until complete
print(run.output)

# ---- Batch run ----
batch = client.runs.batch(
    workflow="amazon-product-scraper",
    inputs=[
        {"url": "https://amazon.com/dp/B09V3KXJPB"},
        {"url": "https://amazon.com/dp/B0BSHF7WHW"},
    ],
    concurrency=2
)
for result in batch.results():
    print(result.output)

# ---- Schedule ----
schedule = client.schedules.create(
    workflow="amazon-product-scraper",
    cron="0 */6 * * *",
    input={"url": "https://amazon.com/dp/B09V3KXJPB"},
    webhook_url="https://yourapp.com/hook"
)

# ---- Direct browser session ----
with client.session() as browser:
    browser.goto("https://example.com")
    browser.click("button.login")
    browser.type("#email", "user@example.com")
    data = browser.extract("Get all product names and prices from this page")
    print(data)  # [{"name": "Widget", "price": 9.99}, ...]

# ---- Studio (conversational) ----
studio = client.studio.create()
studio.send("I want to scrape LinkedIn job postings")
# Returns streaming response with plan + test results
```

### JavaScript/TypeScript SDK

```typescript
import { AnythingAPI } from '@anythingapi/sdk';

const client = new AnythingAPI({ apiKey: 'afa_sk_live_xxx' });

// Create workflow from NL
const workflow = await client.workflows.create({
  prompt: 'Get product price and reviews from any Amazon URL',
  testInput: { url: 'https://amazon.com/dp/B09V3KXJPB' },
});

// Sync run
const result = await client.run('amazon-product-scraper', {
  url: 'https://amazon.com/dp/B09V3KXJPB',
});
console.log(result.title);   // "Apple AirPods Pro (2nd Generation)"
console.log(result.price);   // 189.99

// Stream execution
const stream = client.runs.stream('amazon-product-scraper', {
  url: 'https://amazon.com/dp/B09V3KXJPB',
});
for await (const event of stream) {
  console.log(event.step, event.status);  // "step_1" "completed"
}

// Direct browser
const session = await client.sessions.create();
await session.goto('https://example.com');
const data = await session.extract('Get all prices on this page');
await session.close();
```

### CLI

```bash
# Install
npm install -g @anythingapi/cli
# or
pip install anythingapi-cli

# Auth
afa login

# Create workflow
afa create "Get product price from any Amazon URL"

# Run workflow
afa run amazon-product-scraper --input '{"url": "https://amazon.com/dp/B09V3KXJPB"}'

# List workflows
afa workflows list

# Watch live execution
afa run amazon-product-scraper --input '{"url":"..."}' --stream

# Schedule
afa schedule create amazon-product-scraper --cron "0 */6 * * *" --input '{"url":"..."}'

# Open studio
afa studio
```

---

## 6. EXAMPLE USER FLOWS

### Flow 1: "Describe to API" (Zero to Production in 60 seconds)

```
Timeline:

0:00  User signs up, gets API key
0:10  POST /v1/workflows { prompt: "Get product price from Amazon URL" }
0:15  Planner AI generates workflow DAG (4 steps)
0:20  System auto-runs test against example Amazon URL
0:25  Test passes. Schema inferred: { title, price, currency, rating }
0:30  Workflow saved. API endpoint generated.
0:35  User calls: POST /v1/run/amazon-product-scraper { url: "..." }
0:40  Browser launches, navigates, extracts
0:55  JSON response returned
1:00  User has a production API returning structured Amazon data

Total: ~60 seconds from signup to working API.
```

### Flow 2: Complex Multi-Step with Auth

```
User prompt: "Log into my company's Salesforce, export all leads from
              last 30 days with name, email, company, and deal stage"

Studio conversation:
  AI: "I'll build this. First, I need your Salesforce credentials.
       Please add them to your credential vault."
  User: [adds credentials via dashboard]
  AI: "Got it. Here's my plan:
       1. Login to Salesforce using your credentials
       2. Navigate to Leads view
       3. Set date filter to last 30 days
       4. Extract all visible leads
       5. Paginate through all pages
       6. Return structured JSON

       This workflow has 6 steps. Want me to test it?"
  User: "Yes"
  AI: [runs test, streams live execution with screenshots]
      "Found 247 leads. Here's a sample:
       { name: 'Jane Smith', email: 'jane@acme.com', company: 'Acme', stage: 'Qualified' }
       Deploy as API?"
  User: "Yes, and schedule it daily at 8am"
  AI: [deploys workflow + creates schedule]
      "Done. Your endpoints:
       - On-demand: POST /v1/run/salesforce-leads-export
       - Scheduled: Daily 8:00 AM EST → webhook delivery
       - Dashboard: https://app.anythingapi.com/workflows/wf_xyz"
```

### Flow 3: Marketplace Discovery

```
User browses marketplace → finds "Real Estate Price Monitor"
  → Installs (forks) workflow
  → Customizes: changes city from "NYC" to "Austin"
  → Tests with one listing
  → Deploys
  → Sets up weekly schedule
  → Gets webhook notifications when prices change
```

---

## 7. MVP SCOPE (Phase 1 — 8 Weeks)

### Week 1-2: Foundation
- [ ] Project setup (monorepo: Turborepo + pnpm)
- [ ] Auth system (Clerk or custom JWT + API keys)
- [ ] Database schema (PostgreSQL + Prisma)
- [ ] Basic API gateway (Express/Fastify + rate limiting)
- [ ] Browser pool (Playwright, single-region, 10 concurrent)

### Week 3-4: Core Engine
- [ ] Workflow CRUD API
- [ ] AI Planner (NL → workflow DAG using Claude)
- [ ] Basic step types: navigate, wait, extract, click
- [ ] Sync execution engine (queue + single worker)
- [ ] Schema inference from extraction results

### Week 5-6: Studio + DX
- [ ] Chat-based studio (WebSocket + SSE streaming)
- [ ] Live execution viewer (step-by-step + screenshots)
- [ ] Auto-generated API endpoints per workflow
- [ ] Python SDK (core methods: create, run, list)
- [ ] Basic web dashboard (workflow list, run history)

### Week 7-8: Polish + Launch
- [ ] Async execution mode + webhooks
- [ ] Basic scheduling (cron)
- [ ] Retry logic (exponential backoff)
- [ ] Error handling + meaningful error messages
- [ ] Usage metering + free tier limits
- [ ] Landing page + docs site
- [ ] Deploy to production (Fly.io / Railway)

### MVP Feature Matrix

| Feature | MVP | V2 | V3 |
|---|---|---|---|
| NL → Workflow | Yes | - | - |
| Sync API runs | Yes | - | - |
| Chat studio | Yes | - | - |
| 5 step types | Yes | - | - |
| Python SDK | Yes | - | - |
| API key auth | Yes | - | - |
| Basic scheduling | Yes | - | - |
| Async runs | Yes | - | - |
| Visual builder | - | Yes | - |
| Self-healing | - | Yes | - |
| Batch runs | - | Yes | - |
| JS SDK + CLI | - | Yes | - |
| Marketplace | - | - | Yes |
| Agent memory | - | Yes | - |
| Credential vault | - | Yes | - |
| Multi-region | - | - | Yes |
| Team workspaces | - | - | Yes |
| Enterprise SSO | - | - | Yes |

---

## 8. TECH STACK (Recommended)

| Layer | Technology | Why |
|---|---|---|
| **Monorepo** | Turborepo + pnpm | Fast builds, shared packages |
| **Backend** | Node.js + Fastify | High throughput, low overhead |
| **API types** | TypeScript + Zod | Runtime validation + type safety |
| **Database** | PostgreSQL (Neon) | Serverless-friendly, robust |
| **ORM** | Drizzle ORM | Lightweight, type-safe, fast |
| **Queue** | BullMQ + Redis (Upstash) | Reliable job processing |
| **Browser** | Playwright | Best automation library, cross-browser |
| **AI** | Claude Sonnet 4.6 (planner), Claude Haiku 4.5 (executor) | Best structured output + speed |
| **Frontend** | Next.js 15 + Tailwind + shadcn/ui | Fast dev, great DX |
| **Visual builder** | React Flow | Industry standard node editor |
| **Real-time** | Socket.io | WebSocket + SSE fallback |
| **Auth** | Clerk | Fast to integrate, handles teams |
| **Billing** | Stripe (metered billing) | Usage-based pricing native |
| **Storage** | Cloudflare R2 | S3-compatible, cheap egress |
| **Analytics** | ClickHouse (Tinybird) | Fast analytics + metering |
| **Hosting** | Fly.io (backend) + Vercel (frontend) | Edge-ready, auto-scaling |
| **Monitoring** | Sentry + Axiom | Error tracking + log aggregation |
| **Docs** | Mintlify | Beautiful API docs |

---

## 9. FUTURE ROADMAP

### Phase 2: Growth (Months 3-6)
- Visual workflow builder (React Flow)
- Self-healing engine v1 (auto-fix broken selectors)
- Agent memory system (learn from past runs)
- Credential vault with 2FA support
- JavaScript SDK + CLI tool
- Batch execution mode
- Webhook delivery with retry
- Team workspaces

### Phase 3: Platform (Months 6-12)
- **Marketplace** — publish/discover/install community workflows
- **Composable blocks** — chain workflows together (output of A → input of B)
- **Multi-region** — browser pools in US, EU, APAC
- **Enterprise** — SSO, audit logs, VPC peering, dedicated pools
- **Custom functions** — user-supplied JS/Python that runs alongside browser
- **Data connectors** — push results to Sheets, Airtable, Snowflake, webhooks
- **Monitoring dashboards** — success rates, latency, cost per workflow
- **Workflow templates** — pre-built for top 100 websites

### Phase 4: AI-Native (Year 2)
- **Multi-agent workflows** — multiple AI agents collaborating
- **Autonomous monitoring** — AI detects when a workflow needs updating
- **Smart caching** — AI decides when cached data is stale
- **Natural language querying** — "How has this product's price changed?"
- **Workflow suggestions** — AI suggests new workflows based on usage
- **Cross-workflow intelligence** — learnings from one workflow improve others

---

## 10. MONETIZATION MODEL

### Pricing Tiers

| | Free | Pro ($49/mo) | Team ($149/mo) | Enterprise |
|---|---|---|---|---|
| Runs/month | 100 | 5,000 | 25,000 | Unlimited |
| Browser hours | 5 | 100 | 500 | Custom |
| Concurrent sessions | 2 | 10 | 50 | Custom |
| Workflows | 5 | 50 | Unlimited | Unlimited |
| Schedules | 1 | 20 | 100 | Unlimited |
| Team members | 1 | 1 | 10 | Custom |
| Proxy | Datacenter | Residential | Residential | Dedicated |
| Support | Community | Email | Priority | Dedicated |
| Self-healing | - | Yes | Yes | Yes |
| Marketplace publish | - | Yes | Yes | Yes |
| Credential vault | - | 5 creds | 50 creds | Unlimited |
| SLA | - | 99.5% | 99.9% | 99.99% |

### Usage-Based Overages
| Metric | Price |
|---|---|
| Additional runs | $0.01/run |
| Browser time | $0.05/minute |
| Proxy (residential) | $10/GB |
| Proxy (datacenter) | $1/GB |
| Storage | $0.02/GB/month |
| AI tokens (planner) | $0.003/1K tokens |

---

## 11. COMPETITIVE DIFFERENTIATION

### vs. Notte
| Notte | API for Anything |
|---|---|
| Browser infrastructure focus | End-to-end workflow platform |
| SDK-first, developer builds logic | AI builds the workflow from NL |
| No visual builder | Chat + visual builder |
| No marketplace | Community marketplace |
| No self-healing | AI self-healing built in |

### vs. Apify / Bright Data
| Incumbents | API for Anything |
|---|---|
| Write code in their SDK | Describe in plain English |
| Pre-built actors (rigid) | AI-generated workflows (flexible) |
| No chat interface | Conversational Studio |
| Manual maintenance | Self-healing automation |
| Complex pricing | Simple usage-based |

### Unique Innovations

1. **"Describe → API" Pipeline** — No other platform lets you go from English sentence to production API in under 60 seconds.

2. **Self-Healing Workflows** — When a website changes its layout, our AI detects the breakage, takes a screenshot, compares with last success, and auto-repairs the workflow. Zero maintenance.

3. **Composable Automation Blocks** — Chain workflows: "Get LinkedIn profile → Enrich with Clearbit → Add to Salesforce". Each block is independently testable and reusable.

4. **Agent Memory** — The system learns. After scraping Amazon 10,000 times, it knows every selector, every anti-bot pattern, every edge case. This knowledge is shared (anonymized) across all users.

5. **Conversational Studio** — Build complex automations through chat. The AI asks clarifying questions, shows its plan, tests live, and iterates until the user is satisfied.

6. **Marketplace of Workflows** — Community-built workflows for any website. Install, customize, and deploy in seconds. Creators earn per-use royalties.
