# Technical Decisions

## Rendering And State

- Next.js App Router server-renders the initial list and run/comparison routes.
- Client state is limited to filters, active tab, and two-run selection.
- Query parameters make filter and comparison routes shareable.

## Contracts

- GraphQL is read-only because the UI needs nested evidence, metrics, workload,
  and provenance in one request.
- Zod validates adapter responses. Mapping converts GraphQL enum casing at one
  boundary rather than leaking transport shapes into views.
- Fixture mode implements the same repository port and is labeled in the UI.

## Libraries

- TypeScript 6.0.3: latest compiler line accepted by the Next.js ESLint toolchain;
  TypeScript 7.0.2 was tested and rejected because `typescript-eslint` fails fast
  against its unsupported compiler API.
- ESLint 9.39.5: newest major accepted by Next's React, import, and accessibility
  plugins; ESLint 10.9.1 was rejected after peer-contract warnings.
- npm install scripts are denied by default; the resolver's reviewed
  `unrs-resolver@1.12.2` postinstall is the only version-pinned approval.
- ECharts: dense metric visualization and a measurable chart completion event.
- Lucide React: consistent accessible interface icons.
- Vitest: fast domain/application contract tests.
- Playwright: end-to-end workflows, screenshots, and browser performance entries.

## SOLID And Simplicity

- SRP: queries, mapping, summaries, comparisons, and views have separate reasons
  to change.
- OCP/LSP: new evidence sources implement `EvidenceRepository` without changing
  application services; fixture and GraphQL adapters share observable semantics.
- ISP/DIP: the UI depends on read capabilities only, never the complete API.
- KISS/YAGNI: no mutation, client cache, state library, BFF, broker, database,
  cloud adapter, or microfrontend split.
