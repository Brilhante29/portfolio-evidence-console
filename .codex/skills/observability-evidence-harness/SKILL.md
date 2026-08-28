---
name: observability-evidence-harness
description: Design or audit local-first observability proof that correlates one real incident across metrics, traces, and logs. Use when Codex must instrument a service through OTLP, split fast evidence from a full Grafana exploration stack, measure recovery with a monotonic clock, preserve non-root Docker portability, or publish source-locked exact-head evidence.
---

# Observability Evidence Harness

## Workflow

1. Start from the operational claim. Use this harness only when the project must prove correlation across metrics, traces, and logs; do not add three backends to an unrelated repository.
2. Keep domain and application code independent of FastAPI, OpenTelemetry, Prometheus, Grafana, storage, brokers, and cloud SDKs. Compose telemetry in adapters and switch providers through the OTLP endpoint.
3. Build two profiles. The evidence profile contains only the workload, Collector, and fail-closed benchmark. The exploration profile adds Prometheus, Tempo, Loki, Grafana, provisioned datasources, and a versioned dashboard.
4. Drive a real `200 -> 503 -> 200` lifecycle. Measure detection and recovery with a monotonic runtime clock. Require at least three runs, one incident ID per run, three unique lifecycle trace IDs, and every ID in all three signals.
5. Keep the application, Collector, and benchmark non-root. For shared evidence on Linux and Windows, initialize named volumes from an image-owned UID and copy result artifacts explicitly after the benchmark exits.
6. Start every full backend and navigate the evidence. Compose parsing is insufficient: require healthy endpoints, Prometheus target `up`, trace retrieval from Tempo, correlated events from Loki, and provisioned Grafana datasources/dashboard.
7. Pin application dependencies, actions, and container images. If publication evidence references an older source commit, checkout with `fetch-depth: 0` before validating it. Publish only after exact final-head CI succeeds.

## Cloud Boundary

Keep the local Collector as the routing boundary. A real cloud backend is selected through `OTEL_EXPORTER_OTLP_ENDPOINT` and credentials outside the default path. Do not invent provider interfaces inside the domain when OTLP already supplies the portability contract.

## Reject

Reject logical or manually advanced clocks, prewritten evidence, correlation below `1.0`, missing lifecycle trace IDs, dashboard-only claims, full stacks with no fast evidence profile, bind-mounted writable evidence that depends on host UID behavior, root Collector/benchmark shortcuts, depth-1 provenance checks, mutable image tags, and Kafka, RabbitMQ, databases, or microservices without an independent product force.
