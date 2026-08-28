# Decision Register: #32 portfolio-evidence-console

| Decision | Selected option | Why | Revisit trigger |
|---|---|---|---|
| Architecture | MVVM-style modular monolith | rich view state, one product and deployment | independent deployment ownership appears |
| Boundary | application-owned `EvidenceRepository` | transport substitution and isolated tests | write capabilities are introduced |
| Data source | fixture by default, GraphQL by environment | no-secret local path plus live plugability | offline write/sync requirement |
| Rendering | App Router SSR plus client interaction islands | inspectable initial response and responsive controls | measured hydration cost breaches gate |
| Visualization | ECharts canvas | dense chart plus measurable completion event | bundle/performance budget is breached |
| API | GraphQL read-only | nested metrics/workload/provenance query | commands or simple cacheable resources dominate |
| Messaging/storage/cloud | none | no corresponding problem force | explicit async, persistence, or provider capability |

## Principles In Code

- **SRP:** mapping, comparison, repository access, composition, routes, and views change independently.
- **OCP/LSP:** a new evidence source implements the same observable read contract.
- **ISP/DIP:** the UI receives only read capabilities and application types.
- **DRY:** shared knowledge is the evidence contract; project layout is not abstracted into a framework.
- **KISS/YAGNI:** one deployable, local state, no speculative infrastructure.
- **Law of Demeter:** views call view-model behavior and do not traverse transport envelopes.
