# Decision Context: #32 portfolio-evidence-console

This file exposes reviewable rationale and evidence, never private chain-of-thought.

## Objective

- Program: Portfolio Evidence Platform
- Claim: verified evidence is useful as a product, not only as JSON artifacts.
- Primary benchmark: browser filter input to ECharts `finished`, p95 in milliseconds.
- Done: no-secret Docker path, tests/build/E2E/visual/benchmark evidence, exact-head CI, and kit feedback.

## Recorded Decisions

| Decision | Selected option | Evidence | Revisit trigger |
|---|---|---|---|
| Architecture | modular monolith, MVVM-style vertical slices | `sdd/architecture-decision.md` | independent teams/deployments or view-state coupling appears |
| Runtime | Node 24, Next.js 16, React 19 | build and browser workflow | support/performance regression |
| Language/tooling | TypeScript 6.0.3, ESLint 9.39.5 | tested peer compatibility | Next lint stack accepts next major |
| API | read-only GraphQL through `EvidenceRepository` | nested evidence contract | command workflow or caching force appears |
| State | SSR initial read plus page-local React state | small UI state surface | cross-route durable state becomes measurable |
| Messaging/storage/cloud | none | no async, persistence, or provider capability | a real requirement appears; AWS parity starts with Kumo |

## Boundary Checks

- [x] Domain and application policy import no React, Next, GraphQL, browser, or fixture code.
- [x] Fixture and GraphQL adapters satisfy the application-owned read port.
- [x] Zod validates untrusted transport shapes at the adapter boundary.
- [x] SRP, OCP, LSP, ISP, DIP, KISS, YAGNI, and Law of Demeter are reflected in code and tests.
- [x] Speculative broker, database, BFF, auth, global state, and cloud layers were rejected.

## Handoff

- Current status: source commit must be created, then full benchmark runs on a clean tree.
- Last verified: build, 14 tests with coverage, 6 E2E workflows, visual canvas/overflow checks, benchmark calibration.
- Exact next action: commit implementation and run `npm run benchmark` before editing evidence documents.
