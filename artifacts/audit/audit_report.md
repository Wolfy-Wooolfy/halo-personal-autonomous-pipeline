# Audit Report

- execution_id: EXEC-724563529367
- blocked: true

## Summary
Audit detected CRITICAL governance violations under Artifact Namespace Integrity.

## CRITICAL Violations
- artifacts/reports/ is not an allowed namespace under current DOC-38 rule.
- artifacts/stage_C/ is not an allowed namespace under current DOC-38 rule.
- artifacts/tasks/ is not an allowed namespace under current DOC-38 rule.

## Warnings
- Deprecated naming references exist in immutable historical artifacts.
- Unexpected root-level file: C

FAIL-CLOSED RESULT: BLOCKED