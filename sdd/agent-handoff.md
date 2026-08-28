# Agent Handoff

Updated: 2026-08-28

## Objective

Publish #32 as the public read experience for the Portfolio Evidence Platform.

## Current State

- Status: release candidate; local gates and reuse promotion complete, remote publication pending.
- Producer contract: `portfolio-evidence-api` main `88fa375`.
- Architecture: MVVM-style vertical slices with `EvidenceRepository` port.
- Runtime: Node 24 Docker; fixture mode is the no-secret default.

## Required Gates

1. Complete dashboard, comparison, detail, filters, responsive navigation, and
   explicit fixture/live source state.
2. Pass typecheck, lint, unit tests, production build, Playwright desktop/mobile,
   Docker health, and benchmark calibration.
3. Create a clean-source browser benchmark and immutable V2 evidence.
4. Publish with exact-head CI and align Desktop. Generic frontend improvements
   are already proven in `portfolio-reuse-kit` at `ad5df96`.

## Do Not

- Do not add mutations, Apollo, Redux, database, broker, Kumo, AWS, or auth
  without a measured product force.
- Do not modify #31's API to hide a frontend modeling problem.
- Do not claim Lighthouse/interaction numbers before a real browser run.
