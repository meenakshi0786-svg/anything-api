# API for Anything — Project Structure

```
anything-api/
├── apps/
│   ├── web/                        # Next.js 15 frontend
│   │   ├── app/
│   │   │   ├── (auth)/             # Login, signup
│   │   │   ├── (dashboard)/        # Main app
│   │   │   │   ├── workflows/      # Workflow list + detail
│   │   │   │   ├── runs/           # Execution history
│   │   │   │   ├── studio/         # Chat + visual builder
│   │   │   │   ├── marketplace/    # Browse community workflows
│   │   │   │   ├── settings/       # API keys, billing, team
│   │   │   │   └── credentials/    # Credential vault
│   │   │   ├── api/                # Next.js API routes (BFF)
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── studio/
│   │   │   │   ├── chat-panel.tsx
│   │   │   │   ├── workflow-canvas.tsx    # React Flow visual builder
│   │   │   │   ├── step-inspector.tsx
│   │   │   │   ├── execution-viewer.tsx
│   │   │   │   └── schema-preview.tsx
│   │   │   ├── workflows/
│   │   │   │   ├── workflow-card.tsx
│   │   │   │   ├── workflow-detail.tsx
│   │   │   │   ├── run-history.tsx
│   │   │   │   └── api-playground.tsx
│   │   │   └── ui/                        # shadcn/ui
│   │   └── lib/
│   │       ├── api-client.ts
│   │       └── hooks/
│   │
│   ├── api/                        # Fastify backend
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── routes/
│   │   │   │   ├── workflows.ts
│   │   │   │   ├── runs.ts
│   │   │   │   ├── schedules.ts
│   │   │   │   ├── studio.ts
│   │   │   │   ├── marketplace.ts
│   │   │   │   ├── credentials.ts
│   │   │   │   ├── sessions.ts
│   │   │   │   └── health.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── rate-limit.ts
│   │   │   │   └── metering.ts
│   │   │   ├── services/
│   │   │   │   ├── workflow.service.ts
│   │   │   │   ├── execution.service.ts
│   │   │   │   ├── studio.service.ts
│   │   │   │   ├── schedule.service.ts
│   │   │   │   ├── credential.service.ts
│   │   │   │   └── billing.service.ts
│   │   │   └── lib/
│   │   │       ├── db.ts
│   │   │       ├── redis.ts
│   │   │       └── s3.ts
│   │   └── drizzle/
│   │       ├── schema.ts
│   │       └── migrations/
│   │
│   └── worker/                     # Execution worker
│       ├── src/
│       │   ├── worker.ts           # BullMQ worker entry
│       │   ├── executor/
│       │   │   ├── engine.ts       # Main execution loop
│       │   │   ├── steps/          # Step type handlers
│       │   │   │   ├── navigate.ts
│       │   │   │   ├── click.ts
│       │   │   │   ├── extract.ts
│       │   │   │   ├── type-text.ts
│       │   │   │   ├── wait-for.ts
│       │   │   │   ├── paginate.ts
│       │   │   │   ├── scroll.ts
│       │   │   │   ├── condition.ts
│       │   │   │   ├── loop.ts
│       │   │   │   ├── auth.ts
│       │   │   │   ├── transform.ts
│       │   │   │   └── ai-decide.ts
│       │   │   └── context.ts
│       │   ├── browser/
│       │   │   ├── pool.ts
│       │   │   ├── session.ts
│       │   │   ├── anti-detect.ts
│       │   │   └── proxy.ts
│       │   ├── ai/
│       │   │   ├── planner.ts      # NL → workflow DAG
│       │   │   ├── executor-ai.ts  # Runtime AI decisions
│       │   │   ├── self-healer.ts
│       │   │   ├── schema-inferrer.ts
│       │   │   └── memory.ts
│       │   └── lib/
│       │       └── llm.ts
│       └── Dockerfile
│
├── packages/
│   ├── db/                         # Shared database package
│   │   ├── schema.ts
│   │   ├── client.ts
│   │   └── migrations/
│   ├── types/                      # Shared TypeScript types
│   │   ├── workflow.ts
│   │   ├── run.ts
│   │   ├── api.ts
│   │   └── index.ts
│   ├── config/
│   │   ├── env.ts
│   │   └── constants.ts
│   └── utils/
│       ├── schema-validator.ts
│       └── retry.ts
│
├── sdks/
│   ├── python/                     # Python SDK
│   │   ├── anythingapi/
│   │   │   ├── __init__.py
│   │   │   ├── client.py
│   │   │   ├── workflows.py
│   │   │   ├── runs.py
│   │   │   ├── sessions.py
│   │   │   └── types.py
│   │   ├── pyproject.toml
│   │   └── README.md
│   └── typescript/                 # JS/TS SDK
│       ├── src/
│       │   ├── index.ts
│       │   ├── client.ts
│       │   ├── workflows.ts
│       │   ├── runs.ts
│       │   ├── sessions.ts
│       │   └── types.ts
│       └── package.json
│
├── docs/                           # Mintlify docs
│   ├── mint.json
│   ├── introduction.mdx
│   ├── quickstart.mdx
│   └── api-reference/
│
├── docker-compose.yml
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
└── .env.example
```

## Key Architecture Decisions

| Decision | Choice | Why |
|---|---|---|
| Monorepo | Turborepo + pnpm | Shared types, single CI/CD, atomic changes |
| Separate Worker | Own process | Browser sessions are ~200MB each; isolated crash domain |
| Fastify over Express | Performance | 2-3x faster, built-in schema validation, first-class TS |
| Drizzle over Prisma | Lightweight | No binary engine, SQL-like API, better edge compat |
| Claude for AI | Planner + Executor | Best structured output, reliable tool use |
