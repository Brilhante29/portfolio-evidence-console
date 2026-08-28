# Benchmark Proof

- Primary metric: `filter_to_chart_p95_ms`, lower is better, gate below 120 ms.
- Workload: production standalone, Chromium 151, 1440x1000, 5 warmups, 30 measured alternating project filters.
- Completion marker: ECharts `finished` event writes the expected chart revision.
- Secondary evidence: LCP, CLS, and transferred Next static bytes.
- Provenance: V2 result records clean commit, fixture/config/lock/artifact digests and environment.

Calibration passed at 35.519 ms p95. This is not the publication claim; the clean-source result remains pending until `npm run benchmark` runs immediately after the implementation commit.
