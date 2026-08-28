# References And Reuse Provenance

| Reference                                                                       | License    | Used for                                                                       | Copied code?                       |
| ------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| [portfolio-reuse-kit](https://github.com/Brilhante29/portfolio-reuse-kit)       | MIT        | scaffold, skills, SDD/OpenSpec, design tokens, validators, versioned contracts | generated and vendored assets only |
| [portfolio-evidence-api](https://github.com/Brilhante29/portfolio-evidence-api) | MIT        | GraphQL read contract and producer boundary                                    | contract only                      |
| [Next.js](https://nextjs.org/docs)                                              | MIT        | App Router, SSR, routing, standalone output                                    | no                                 |
| [React](https://react.dev/)                                                     | MIT        | client interaction and page-local state                                        | no                                 |
| [Apache ECharts](https://echarts.apache.org/en/index.html)                      | Apache-2.0 | canvas evidence visualization and completion event                             | no                                 |
| [Zod](https://zod.dev/)                                                         | MIT        | fail-closed GraphQL boundary validation                                        | no                                 |
| [Lucide](https://lucide.dev/)                                                   | ISC        | accessible interface icons                                                     | no                                 |
| [Playwright](https://playwright.dev/docs/intro)                                 | Apache-2.0 | E2E, visual QA, browser benchmark                                              | no                                 |
| [Vitest](https://vitest.dev/)                                                   | MIT        | domain, application, and adapter tests                                         | no                                 |
| [sivchari/kumo](https://github.com/sivchari/kumo)                               | Apache-2.0 | recorded local-first gate for any future AWS capability                        | no                                 |

No tutorial application or third-party project code was copied. Dependency APIs are consumed through their packages; contract and scaffold reuse remains checksum/version visible.
