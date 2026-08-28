# Component Pack

| Component            | Responsibility                                       | Contract                            |
| -------------------- | ---------------------------------------------------- | ----------------------------------- |
| evidence domain      | metric formatting and immutable run/comparison types | TypeScript types and pure functions |
| analysis application | filter, summarize, sort, and compare policy          | pure functions                      |
| repository port      | list, detail, and two-run comparison capabilities    | `EvidenceRepository`                |
| fixture adapter      | deterministic no-secret source                       | same port semantics                 |
| GraphQL adapter      | request, Zod validation, enum/null mapping           | vendored GraphQL contract           |
| Next composition     | source selection and URL-addressable server routes   | environment plus App Router         |
| React views          | local interaction state and accessible controls      | typed props only                    |
| browser harness      | E2E, pixels, overflow, p95, LCP, CLS, bytes          | Playwright and benchmark V2         |
