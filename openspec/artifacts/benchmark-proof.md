# Benchmark Proof

- Primary metric: `filter_to_chart_p95_ms`, lower is better, gate below 120 ms.
- Workload: production standalone, Chromium 151, 1440x1000, 5 warmups, 30 measured alternating project filters.
- Completion marker: ECharts `finished` event writes the expected chart revision.
- Secondary evidence: LCP, CLS, and transferred Next static bytes.
- Provenance: V2 result records clean commit, fixture/config/lock/artifact digests and environment.

Publication passed on clean source `868bbb870ee30558791ae0c78d1e74ce7bf4c60a`: 45.996 ms filter-to-chart p95, 696 ms LCP, 0.0859 CLS, 318,437 transferred bytes, and zero failed interactions. The complete samples and digests are in `benchmarks/publication/latest.json`.
