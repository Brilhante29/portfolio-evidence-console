# Reuse Improvement Review

Project: `32 - portfolio-evidence-console`

## Review Points

- [x] after scaffold
- [x] after architecture decision
- [ ] after first working slice
- [ ] after benchmark result
- [ ] before publication
- [ ] after CI or validation failure

## Findings

| Finding                                               | Classification | Kit Area       | Action                                                  | Status   |
| ----------------------------------------------------- | -------------- | -------------- | ------------------------------------------------------- | -------- |
| Next.js profile exists but no mirrored frontend skill | patch_now      | skills         | Promote proven routing, state, contract, and test rules | pending  |
| Generator has no Node/Next Docker or CI template      | patch_now      | templates      | Extract only after #32 proves the implementation        | pending  |
| Shared tokens are README-oriented, not CSS-ready      | patch_now      | design-system  | Generate stable web tokens without app-specific layout  | pending  |
| Apollo/Redux would add unused runtime state           | reject         | decision-brain | Keep server reads and page-local state                  | rejected |

## Final Gate

- [ ] Reusable improvements are patched or recorded.
- [x] Project-specific product code remains outside the kit.
- [x] Rejected infrastructure has an explicit problem-force gate.
