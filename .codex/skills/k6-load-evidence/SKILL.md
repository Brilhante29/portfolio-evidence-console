---
name: k6-load-evidence
description: Design, execute, validate, and publish multi-run k6 load curves with fail-closed thresholds, isolated CI smoke evidence, and source-locked V2 provenance.
---

# k6 Load Evidence

1. Use k6 only for a real HTTP, WebSocket, gRPC, or browser contract. Keep the target implementation outside the reusable harness.
2. Define at least two explicit load levels and at least two complete repetitions. Run levels sequentially when they share one target so windows do not contaminate each other.
3. Keep setup and warmup traffic outside custom request, error, latency, and throughput metrics.
4. Set executable thresholds for checks, transport failures, domain failures, and p95. A zero-request level, non-2xx response, missing metric, or breached threshold fails the command.
5. Store each raw per-run curve. The headline sample for a repetition is p95 at the maximum load; publish the median of those samples and preserve throughput per level.
6. Validate raw evidence with `k6-load-curve-v1`, then wrap it in `benchmark-result-v2` using a clean source commit, image digest, fixture/config digests, dependency lock, and comparability key.
7. Keep CI smoke short and write it outside the checkout or to a distinct ignored path. Never overwrite committed publication evidence.
8. Fetch full Git history for provenance validation and accept publication only after successful CI at the exact final `main` SHA.

Reject one-point tests presented as curves, a `samples` array containing load levels instead of repetitions, setup-inclusive throughput, open-loop and closed-loop results compared as equivalent, hidden interrupted/dropped iterations, prewritten JSON, mutable action refs, or load generators coupled to target internals.
