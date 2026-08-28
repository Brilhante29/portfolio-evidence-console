# Benchmark Proof

- Primary metric: `filter_to_chart_p95_ms`, lower is better, gate below 120 ms.
- Workload: production standalone, Chromium 151, 1440x1000, 5 warmups, 30 measured alternating project filters.
- Completion marker: ECharts `finished` event writes the expected chart revision.
- Secondary evidence: LCP, CLS, and transferred Next static bytes.
- Provenance: V2 result records clean commit, fixture/config/lock/artifact digests and environment.

Publication passed on clean source `f887d2143013cdbd586a7fc4a29709d2726bc7b0`: 41.72 ms filter-to-chart p95, 372 ms LCP, 0.0859 CLS, 318,437 transferred bytes, and zero failed interactions. The runtime image digest is `sha256:626d5a6ba263476a9e463957ac18046e7773bda6a3974298fb1c7d62fbb01049`; complete samples and provenance are in `benchmarks/publication/latest.json`.
