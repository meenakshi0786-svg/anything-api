import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  numeric,
  jsonb,
  index,
  uniqueIndex,
  serial,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ════════════════════════════════════════════════════════════
// USERS & AUTH
// ════════════════════════════════════════════════════════════

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  name: text("name"),
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
  plan: text("plan").notNull().default("free"), // free | pro | team | enterprise
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  plan: text("plan").notNull().default("team"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"), // owner | admin | member | viewer
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("team_members_pk").on(t.teamId, t.userId)]
);

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyHash: text("key_hash").unique().notNull(),
  keyPrefix: text("key_prefix").notNull(), // "afa_1234..."
  scopes: text("scopes").array().notNull().default(["*"]),
  rateLimitRpm: integer("rate_limit_rpm").notNull().default(60),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ════════════════════════════════════════════════════════════
// WORKFLOWS
// ════════════════════════════════════════════════════════════

export const workflows = pgTable(
  "workflows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    teamId: uuid("team_id").references(() => teams.id),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    currentVersion: integer("current_version").notNull().default(1),
    inputSchema: jsonb("input_schema").notNull(),
    outputSchema: jsonb("output_schema").notNull(),
    settings: jsonb("settings").notNull().default({}),
    isPublic: boolean("is_public").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    tags: text("tags").array().default([]),
    category: text("category"),
    usageCount: bigint("usage_count", { mode: "number" }).notNull().default(0),
    avgRuntimeMs: integer("avg_runtime_ms"),
    successRate: numeric("success_rate", { precision: 5, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("workflows_user_slug").on(t.userId, t.slug)]
);

export const workflowVersions = pgTable(
  "workflow_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    steps: jsonb("steps").notNull(),
    inputSchema: jsonb("input_schema").notNull(),
    outputSchema: jsonb("output_schema").notNull(),
    changelog: text("changelog"),
    createdBy: text("created_by").notNull().default("user"), // user | self-healer | studio
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("workflow_versions_unique").on(t.workflowId, t.version)]
);

// ════════════════════════════════════════════════════════════
// EXECUTIONS (RUNS)
// ════════════════════════════════════════════════════════════

export const runs = pgTable(
  "runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => workflows.id),
    workflowVersion: integer("workflow_version").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    apiKeyId: uuid("api_key_id").references(() => apiKeys.id),
    status: text("status").notNull().default("queued"), // queued|starting|running|completed|failed|cancelled
    mode: text("mode").notNull().default("sync"), // sync|async|batch|scheduled
    input: jsonb("input").notNull(),
    output: jsonb("output"),
    error: jsonb("error"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    runtimeMs: integer("runtime_ms"),
    browserMs: integer("browser_ms"),
    proxyBytes: bigint("proxy_bytes", { mode: "number" }).default(0),
    stepCount: integer("step_count"),
    retryCount: integer("retry_count").default(0),
    cacheHit: boolean("cache_hit").default(false),
    region: text("region"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_runs_workflow").on(t.workflowId, t.createdAt),
    index("idx_runs_user").on(t.userId, t.createdAt),
    index("idx_runs_status").on(t.status),
  ]
);

export const runSteps = pgTable("run_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id")
    .notNull()
    .references(() => runs.id, { onDelete: "cascade" }),
  stepId: text("step_id").notNull(),
  status: text("status").notNull(), // pending|running|completed|failed|skipped
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  runtimeMs: integer("runtime_ms"),
  input: jsonb("input"),
  output: jsonb("output"),
  error: jsonb("error"),
  screenshotUrl: text("screenshot_url"),
  domSnapshot: text("dom_snapshot"),
  aiReasoning: text("ai_reasoning"),
});

export const runLogs = pgTable("run_logs", {
  id: serial("id").primaryKey(),
  runId: uuid("run_id")
    .notNull()
    .references(() => runs.id, { onDelete: "cascade" }),
  stepId: text("step_id"),
  level: text("level").notNull().default("info"), // debug|info|warn|error
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

// ════════════════════════════════════════════════════════════
// SCHEDULING
// ════════════════════════════════════════════════════════════

export const schedules = pgTable("schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id")
    .notNull()
    .references(() => workflows.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  cronExpression: text("cron_expression").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  input: jsonb("input").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  webhookUrl: text("webhook_url"),
  lastRunAt: timestamp("last_run_at", { withTimezone: true }),
  nextRunAt: timestamp("next_run_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ════════════════════════════════════════════════════════════
// CREDENTIALS & SESSIONS
// ════════════════════════════════════════════════════════════

export const credentialVaults = pgTable("credential_vaults", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // password | oauth | api_token | cookie
  encryptedData: text("encrypted_data").notNull(), // AES-256-GCM encrypted (base64)
  domain: text("domain"),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const browserProfiles = pgTable("browser_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  cookies: text("cookies"), // encrypted
  localStorage: text("local_storage"), // encrypted
  userAgent: text("user_agent"),
  viewport: jsonb("viewport"),
  fingerprint: jsonb("fingerprint"),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ════════════════════════════════════════════════════════════
// AGENT MEMORY
// ════════════════════════════════════════════════════════════

export const agentMemory = pgTable(
  "agent_memory",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    domain: text("domain").notNull(),
    pagePattern: text("page_pattern"),
    memoryType: text("memory_type").notNull(), // selector|strategy|anti_bot|layout
    key: text("key").notNull(),
    value: jsonb("value").notNull(),
    confidence: numeric("confidence", { precision: 3, scale: 2 }).notNull().default("1.00"),
    hitCount: integer("hit_count").notNull().default(1),
    lastVerified: timestamp("last_verified", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("agent_memory_unique").on(t.domain, t.pagePattern, t.memoryType, t.key),
  ]
);

// ════════════════════════════════════════════════════════════
// MARKETPLACE
// ════════════════════════════════════════════════════════════

export const marketplaceListings = pgTable("marketplace_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id")
    .notNull()
    .references(() => workflows.id),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  iconUrl: text("icon_url"),
  category: text("category").notNull(),
  tags: text("tags").array().default([]),
  pricePerRun: numeric("price_per_run", { precision: 10, scale: 4 }),
  installCount: bigint("install_count", { mode: "number" }).notNull().default(0),
  avgRating: numeric("avg_rating", { precision: 3, scale: 2 }),
  isFeatured: boolean("is_featured").default(false),
  isVerified: boolean("is_verified").default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const marketplaceReviews = pgTable(
  "marketplace_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => marketplaceListings.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("marketplace_reviews_unique").on(t.listingId, t.userId)]
);

export const marketplaceInstalls = pgTable(
  "marketplace_installs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => marketplaceListings.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    forkedWorkflowId: uuid("forked_workflow_id").references(() => workflows.id),
    installedAt: timestamp("installed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("marketplace_installs_unique").on(t.listingId, t.userId)]
);

// ════════════════════════════════════════════════════════════
// BILLING & METERING
// ════════════════════════════════════════════════════════════

export const usageRecords = pgTable("usage_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  teamId: uuid("team_id").references(() => teams.id),
  runId: uuid("run_id").references(() => runs.id),
  metric: text("metric").notNull(), // browser_ms | proxy_bytes | run_count | ai_tokens
  quantity: bigint("quantity", { mode: "number" }).notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 6 }),
  periodStart: date("period_start").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  teamId: uuid("team_id").references(() => teams.id),
  stripeInvoiceId: text("stripe_invoice_id"),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 10, scale: 2 }).default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"), // draft | pending | paid | failed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ════════════════════════════════════════════════════════════
// RELATIONS
// ════════════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ many }) => ({
  workflows: many(workflows),
  apiKeys: many(apiKeys),
  runs: many(runs),
  credentials: many(credentialVaults),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  user: one(users, { fields: [workflows.userId], references: [users.id] }),
  versions: many(workflowVersions),
  runs: many(runs),
  schedules: many(schedules),
}));

export const runsRelations = relations(runs, ({ one, many }) => ({
  workflow: one(workflows, { fields: [runs.workflowId], references: [workflows.id] }),
  user: one(users, { fields: [runs.userId], references: [users.id] }),
  steps: many(runSteps),
  logs: many(runLogs),
}));
