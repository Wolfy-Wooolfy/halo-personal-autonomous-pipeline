# Audit Report

- execution_id: EXEC-5DF395C207B1
- blocked: true

## Summary
Audit detected CRITICAL violations under Artifact Namespace Integrity due to pre-existing legacy artifact namespaces.

## CRITICAL Violations
- artifacts/reports/
- artifacts/tasks/
- artifacts/stage_A/
- artifacts/stage_B/
- artifacts/stage_C/
- artifacts/stage_D/

## Warnings
- Deprecated historical name references exist in legacy artifacts (e.g., release manifests/runbooks).

FAIL-CLOSED RESULT: BLOCKED
