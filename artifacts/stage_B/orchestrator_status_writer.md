# Orchestrator Spec - Status Writer (Minimal)

**Task ID:** TASK-001  
**Stage:** B (Specification)  
**Status:** FINAL — EXECUTION-BOUND

---

## 1. Purpose

Define the deterministic behavior for the orchestrator component responsible for writing authoritative execution state to:

- `progress/status.json`

This spec covers ONLY status writing. No agent execution, no stage logic, no audit execution.

---

## 2. Authoritative Output

### 2.1 File
- Output file MUST be: `progress/status.json`

### 2.2 Schema (Exact Fields Only)

The JSON object MUST contain EXACTLY these fields (no extras):

- `current_stage` (string)
- `execution_state` (string)
- `progress_percent` (number)
- `last_artifact` (string)
- `current_task` (string)
- `blocking_questions` (array)
- `issues` (array)
- `next_step` (string)

---

## 3. Write Mode (Hard Rule)

Status writing MUST be a full overwrite.

- Partial edits are forbidden
- Append mode is forbidden

---

## 4. Fail-Closed Rules

If the payload does not match the schema EXACTLY:
- Writing MUST fail
- No file output MUST occur

If `execution_state` is `BLOCKED`:
- `blocking_questions` MUST contain exactly ONE question
- `next_step` MUST be an empty string

If `execution_state` is `ABORTED`:
- `blocking_questions` MUST be empty
- `next_step` MUST be an empty string

---

END
