# Decision Context: #32 portfolio-evidence-console

This file is a compact, reviewable context card for agents continuing work on
this project. It records rationale and evidence links, not private
chain-of-thought. Keep volatile status in `.portfolio-control/CURRENT_HANDOFF.md`
and generate mechanical state in `.portfolio-control/CONTINUITY_STATE.md`.

## Objective

- Program: _pending_
- Claim: _pending_
- Primary benchmark: _pending_
- Definition of done: _pending_

## Decision Chain

```text
problem and proof target
  -> problem forces
  -> architecture
  -> dependency boundaries and principles
  -> language/framework profile
  -> API style
  -> messaging
  -> local-first/cloud mode
  -> database and libraries
  -> benchmark and release evidence
```

## Recorded Decisions

| Decision | Selected option | Evidence | Revisit trigger |
|---|---|---|---|
| Architecture | _pending_ | `sdd/architecture-decision.md` | _pending_ |
| Stack | _pending_ | `project.yaml`, `sdd/technical-decision.md` | _pending_ |
| API style | _pending_ | contract and decision record | _pending_ |
| Messaging | none until justified | `sdd/technical-decision.md` | async semantics become required |
| Cloud/local-first | Docker; Kumo when AWS-like behavior exists | adapter contract and parity tests | _pending_ |
| Database/runtime | _pending_ | technical decision and tests | _pending_ |
| Libraries | _pending_ | `REFERENCES.md` and technical decision | _pending_ |

## Boundary And Principle Checks

- [ ] Domain and application policy do not import framework or infrastructure.
- [ ] Ports are owned by the policy boundary; adapters depend inward.
- [ ] SRP, OCP, LSP, ISP, and DIP are visible in modules and tests.
- [ ] KISS, YAGNI, DRY, Law of Demeter, and testability are applied without speculative abstractions.
- [ ] Local and real adapters preserve the same contract and failure semantics.

## Evidence State

- [ ] Docker default path works without a paid secret.
- [ ] Tests or smoke checks pass.
- [ ] Benchmark command is reproducible.
- [ ] Benchmark JSON matches the shared contract.
- [ ] README opens with number, claim, and measured result.
- [ ] `REFERENCES.md` records external patterns and licenses honestly.
- [ ] Reuse-improvement review is complete.
- [ ] Current-head CI evidence exists before publication.

## Handoff

- Current status: _pending_
- Blocker and required authorization: _none / pending_
- Dirty files to preserve: _none / list_
- Last verified command: _pending_
- Exact next action: _pending_

## Reuse Improvement

Classify every kit improvement as one of:

- `patch_now`: low-risk and clearly reusable
- `backlog`: useful but needs broader design
- `reject`: project-specific, premature, duplicated, or harmful

Record the classification and evidence in `sdd/reuse-improvement-review.md`.
