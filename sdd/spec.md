# #32 Portfolio Evidence Console Specification

## Problem

The portfolio has durable benchmark artifacts and a read-only GraphQL evidence
API, but a reviewer cannot quickly scan projects, compare compatible runs, or
inspect provenance from one public interface.

## Users And Workflows

1. A recruiter scans verified runs, technologies, latency, throughput, and
   failure status without learning the storage model.
2. An engineer filters by project/status, selects two runs, and sees whether
   their comparability keys permit a valid delta.
3. A reviewer opens a run and verifies source commit, image digest, workload,
   command, and environment.
4. A maintainer switches from deterministic fixture mode to the published
   GraphQL API with one environment variable.

## Acceptance Criteria

- The first screen is the working evidence dashboard, not a landing page.
- Initial evidence is server-rendered; filters and selection remain responsive
  client-side and URL-addressable routes own details/comparison.
- GraphQL responses are validated before entering the domain.
- Fixture and GraphQL repositories obey the same capability-specific port.
- The default Docker path needs no secret or external service.
- Desktop and mobile views have no overlap, clipped labels, or layout shift.
- Tests prove domain/application behavior without React, Next.js, or network.
- A real-browser benchmark records interaction p95, LCP, CLS, and bundle bytes.

## Non-Goals

- No evidence mutation, publication approval, authentication, broker, database,
  cloud adapter, or hidden BFF business logic.
- No comparison across different `comparabilityKey` values.
- No global state or GraphQL cache until measured workflow complexity requires it.
