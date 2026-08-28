# Architecture Record

## Decision

Use a modular monolith with MVVM-style vertical slices. Server routes compose an application-owned `EvidenceRepository`; fixture and GraphQL adapters map to domain types; client components own only filter, selection, chart, and comparison interaction state.

## Dependency Rule

`views -> application port/policy <- infrastructure adapters`. Domain and application modules import no React, Next.js, GraphQL, fetch, browser, or fixture implementation.

## Rejected

- MVC: does not make rich view state and adapter substitution as explicit.
- Microfrontends: one product/team/deployment provides no ownership benefit.
- Apollo/Redux/BFF: no cache, shared command state, or aggregation force.
- Broker/database/cloud: no async, persistence, or provider capability exists.
