---
name: node-typescript-backend
description: Apply the Node.js/TypeScript backend profile using NestJS/Rocketseat-style modular Clean Architecture, Prisma, REST vs GraphQL decisions, Express vs Fastify tradeoffs, validation, tests, and benchmarks.
---

# Node TypeScript Backend

Use this skill when `decision_brain.stack_profile` is `node-typescript-backend`.

1. Read `language-profiles/node-typescript-backend.yaml` or `.portfolio/language-profiles/node-typescript-backend.yaml`.
2. Prefer NestJS for structured backend projects that should show modular architecture, dependency injection, controllers/resolvers, providers, guards, pipes, and testability.
3. Use Rocketseat-style organization as a reference for clean boundaries: `core`, `domain`, `application/use-cases`, `infra`, and `test`.
4. Choose REST/HTTP by default for CRUD and command APIs.
5. Choose GraphQL only when flexible client graph reads, BFF aggregation, or schema-driven client workflow is part of the proof.
6. Use Prisma by default for product persistence; choose Kysely when controlled SQL and SQLite/PostgreSQL adapter parity are part of the proof.
7. Use Express by default; use Fastify when p95/p99 performance is part of the benchmark and middleware compatibility is checked.
8. Keep controllers/resolvers thin and route everything through use cases.
9. Add Vitest/Jest and Supertest for HTTP tests; add GraphQL operation tests when GraphQL is selected.
10. Export OpenAPI or GraphQL schema when relevant.
11. Commit the lockfile, use `npm ci`, pin Actions by full SHA, and fail closed on high or critical advisories.
12. Fix vulnerable transitive packages in the lockfile. Do not silence advisories; distinguish registry transport failures from real findings.
13. If ordinary `npm audit` transport is proven unreliable, reuse `harness/node/npm-advisory-audit.mjs`; its identity/gzip decoding, malformed-body handling, severity ordering, and bounded retries were remotely proven by `portfolio-evidence-api` CI run `33205651604`.
14. Exercise native modules in the declared Node Docker image; host-only success is insufficient.

Rule: TypeScript backend repos must prove structure and typed contracts, not just Node endpoints.
