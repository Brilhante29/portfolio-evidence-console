# ADR-001: MVVM-Style Vertical Slices Over A GraphQL Read Port

Status: accepted

## Context

The console combines SSR, filters, selection, charts, run details, and
comparison state. The evidence transport must remain replaceable and the public
product must never acquire mutation responsibilities.

## Decision

Use MVVM-style vertical slices. Domain evidence and comparison rules are pure;
application services depend on `EvidenceRepository`; GraphQL and fixtures are
adapters; Next.js routes compose server reads; React hooks/components own view
state only.

## Dependency Rule

Dependencies point from Next.js/React and infrastructure toward application and
domain. Domain and application modules import no framework, fetch API, browser
API, environment variable, or fixture file.

## Rejected

- MVC: it obscures rich view-state ownership and transport substitution.
- Apollo Client: normalized caching is not justified by server reads and a
  bounded read-only dataset.
- Microfrontends: no independent team or deployment boundary exists.
- Angular: reserved for #33's command-heavy operations workflows.
