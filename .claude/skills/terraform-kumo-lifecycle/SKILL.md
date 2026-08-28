---
name: terraform-kumo-lifecycle
description: Design or audit Terraform infrastructure that provisions through pinned Kumo locally, switches to AWS through provider configuration, reuses one resource module, and publishes apply/destroy lifecycle evidence.
---

# Terraform Kumo Lifecycle

## Workflow

1. Use this skill only when the repository must prove AWS-compatible infrastructure behavior. Do not add Terraform or Kumo for keyword coverage.
2. Declare resources once in a shared Terraform module. Create separate local Kumo and real AWS roots that differ only in provider endpoint, credentials, validation behavior, and environment policy.
3. Pin Terraform, the AWS provider lockfile, Kumo's readable image tag, and Kumo's immutable digest. The default path must not require a cloud account or paid resource.
4. Build provider cache layers from version and lock files before copying changing source or docs. Keep the cache readable by the non-root runtime; do not recursively `chown` it into a duplicate Docker layer.
5. Run Kumo and Terraform from one non-root execution boundary. Start the emulator, wait for its port, apply the fixture, assert adapter outputs and state resource count, destroy, then assert empty state.
6. Run at least one complete warmup and three measured apply/destroy cycles. Fail on every lifecycle error, resource-count mismatch, cleanup residue, or parity value below `1.0`.
7. Emit `terraform-kumo-lifecycle-v1` plus benchmark V2. Lock publication to a clean source commit, image digest, provider locks, full-history provenance validation, and exact-head CI.
8. Record every emulator compatibility exception by Kumo version, service, operation, and scoped workaround. Never turn a local suite into a full AWS conformance or performance claim.

## Adapter Contract

The shared module must not contain Kumo endpoint URLs, static local credentials, benchmark logic, or environment switches. The AWS adapter must not contain emulator endpoints or fake credentials. Both adapters expose the same logical outputs.

## Reject

Reject `terraform_data` presented as cloud provisioning, duplicated local/AWS resource declarations, `plan` presented as apply time, mutable Kumo images, AWS credentials in CI, real-cloud apply as the default demo, dirty-tree evidence, fewer than three measured cycles, residual state after destroy, hidden failed samples, provider caches invalidated by README changes, and unsupported-behavior notes without a versioned operation boundary.
