# Runtime Entrypoints and Tooling
Document ID: DOC-RT-10_10
Status: EXECUTION-BOUND
Scope: Runtime + CLI entrypoints + tooling contracts

## 1) Purpose

This document defines the executable entrypoints and tooling that operate Forge as a deterministic, fail-closed pipeline.

It is execution-bound in the sense that:
- All runtime commands MUST map to existing code entrypoints.
- All pre-run and integrity checks MUST be reproducible and auditable.
- Smoke tests provide bounded verification evidence.

## 2) Repository Entry Points

### 2.1 Primary CLI Entrypoints

#### A) Single-step autonomy runner
Path:
- bin/halo-autonomy-step.js

Purpose:
- Executes exactly one bounded autonomy step.
- Reads progress/status.json for next_step.
- Enforces idempotency at task/artifact level.

Expected behavior:
- If next_step is empty or READY, exits without mutation.
- If next_step indicates a task handler, dispatches to task executor.

#### B) Full run orchestrator
Path:
- bin/halo-run.js

Purpose:
- Executes the orchestrated pipeline run.
- Delegates to orchestrator modules.
- Uses status_writer to persist progress mutations.

Expected behavior:
- Fail-closed: stops on any contract mismatch or idempotency violation.
- Deterministic: same inputs produce same artifacts.

### 2.2 Core Runtime Modules

#### Orchestrator
Paths:
- code/src/orchestrator/runner.js
- code/src/orchestrator/stage_transitions.js
- code/src/orchestrator/status_writer.js

Responsibilities:
- runner.js: runtime control loop and bounded execution sequencing.
- stage_transitions.js: gate and stage transition enforcement.
- status_writer.js: authoritative state mutation to progress/status.json.

#### Task Execution
Paths:
- code/src/execution/task_executor.js
- code/src/execution/task_registry.js

Responsibilities:
- task_registry.js: resolves a task name to a handler implementation.
- task_executor.js: validates handler output schema and enforces task contracts.

## 3) Tooling

### 3.1 Pre-run checks
Path:
- tools/pre_run_check.js

Purpose:
- Validates runtime environment prerequisites and repository readiness.
- Fail-closed if required inputs or directories are missing.

Output:
- Must end in PASS for execution to proceed under governed runs.

### 3.2 Integrity verification
Path:
- tools/integrity.js

Baseline reference:
- release_local_v2.hashes.json

Purpose:
- Verifies repository file integrity against the baseline hashes file.

Rule:
- Integrity verification must pass before any governed execution that claims baseline compliance.

## 4) Verify and Smoke

### 4.1 Smoke tests
Paths:
- verify/smoke/runner_smoke.js
- verify/smoke/runner_dry_run_smoke.js
- verify/smoke/status_writer_smoke.js
- verify/smoke/stage_transitions_smoke.js

Purpose:
- Provide bounded functional checks for orchestrator and status mutation logic.
- Fail-closed: any smoke failure blocks execution claims.

## 5) Known Gaps and Mapping Notes

1) Some verification expectations exist as specifications under docs/09_verify/* while runtime smoke exists under verify/smoke/*.
2) If a verify output is specified in docs but not produced by code, it must be treated as a documentation-to-code gap and handled via a governed backfill task.

## 6) Non-authority Clause

This document does not override progress/status.json.
The next_step in progress/status.json remains the only authority for what runs next.