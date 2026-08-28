# Portfolio Control: #32 portfolio-evidence-console

## Identity

- **Program:** Portfolio Evidence Platform
- **Status:** implementation verified; clean-source publication benchmark pending
- **Proves:** reviewers can inspect and compare verified evidence without coupling product policy to its GraphQL transport.
- **Primary benchmark:** `filter_to_chart_p95_ms`

## Evidence Map

| Evidence | Location | State |
|---|---|---|
| Specification | `sdd/spec.md` | aligned |
| Architecture and technical decisions | `sdd/architecture-decision.md`, `sdd/technical-decision.md` | aligned |
| Unit/contract tests | `src/**/*.test.ts` | 14 passing; 99.13% statements |
| Browser workflows | `tests/e2e/console.spec.ts` | 6 passing across desktop/mobile |
| Visual proof | `screenshots/`, `tools/capture-screenshots.mjs` | canvas and overflow checks passing |
| Benchmark | `benchmarks/run.mjs` | calibration passing; publication pending |
| Docker and CI | `Dockerfile`, `.github/workflows/ci.yml` | local Docker and remote CI pending |
| Reuse review | `sdd/reuse-improvement-review.md` | extraction pending after publication |
