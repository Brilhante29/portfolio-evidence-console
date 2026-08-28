# Portfolio Control: #32 portfolio-evidence-console

## Identity

- **Program:** Portfolio Evidence Platform
- **Status:** published; local gates and release-candidate exact-head CI passed
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
| Benchmark | `benchmarks/results/latest.json` | 41.72 ms p95; clean-source V2 |
| Docker and CI | `Dockerfile`, `.github/workflows/ci.yml` | local Docker passed; release-candidate CI `33217199932` passed |
| Reuse review | `sdd/reuse-improvement-review.md` | generic deltas published and verified in reuse kit |
