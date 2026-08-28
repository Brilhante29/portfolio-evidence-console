# Benchmark Plan

## Claim

The console keeps dense evidence filtering and chart updates responsive while
rendering the first public view with stable layout.

## Workload

- Fixture: deterministic evidence runs expanded to a controlled browser dataset.
- Browser: Chromium in a fixed 1440x1000 viewport.
- Warmup: 5 filter interactions.
- Measurement: 30 filter-to-chart interactions after 5 warmups.
- Build: production Next.js standalone output under Node 24.

## Metrics

| Metric                        | Direction       | Source                                       |
| ----------------------------- | --------------- | -------------------------------------------- |
| `filter_to_chart_p95_ms`      | lower is better | click to chart `finished`/view commit marker |
| `largest_contentful_paint_ms` | lower is better | browser PerformanceObserver                  |
| `cumulative_layout_shift`     | lower is better | layout-shift entries without recent input    |
| `next_static_transfer_bytes`  | lower is better | transferred Next static resources            |

## Gates

- Zero browser/page errors and zero failed interactions.
- p95 filter-to-chart below 120 ms on the declared local hardware class.
- CLS below 0.10.
- Result validates against benchmark-result V2 with clean source and digests.
- CI runs a bounded calibration; only a clean full run becomes publication proof.
