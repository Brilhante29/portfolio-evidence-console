# From Benchmark JSON To A Reviewable Portfolio Product

The portfolio already had reproducible benchmarks and a read API. The missing piece was review speed: evidence was technically available but not easy to scan, compare, or audit.

#32 adds that product layer. The console server-renders a verified registry, filters locally, blocks invalid comparisons by contract, and exposes workload plus provenance on every detail route. A small application-owned repository port keeps the same UI running against a deterministic fixture or live GraphQL.

The benchmark measures the real interaction: filter change to the ECharts completion event. The final post will report the clean-source p95, LCP, CLS, static transfer size, environment, and exact commit rather than a synthetic score without provenance.
