# Audit Report

## Summary
- blocked: true
- total_checks: 186
- passed_checks: 183
- failed_checks: 3

## Violations
- **WARNING** [RegistryClosureConsistency] artifacts/tasks/ — NON-AUTHORITATIVE orphan execution closures detected -> TASK-030, TASK-060, TASK-064
- **WARNING** [ArtifactNamespaceIntegrity] artifacts/stage_D/verification_report.md — Duplicate artifact filename across namespaces: verification_report.md
- **CRITICAL** [DriftDetection] code/src/orchestrator/runner.js — Hash snapshot mismatch detected (hash_mismatch) vs release_local_v4.hashes.json
