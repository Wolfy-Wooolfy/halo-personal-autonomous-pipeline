# Orchestrator Spec - Status Writer (Minimal)

**Task ID:** TASK-001  
**Stage:** B (Specification)  
**Status:** DRAFT (Stage B)

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

No additional fields are permitted.

---

## 3. Allowed Values

### 3.1 current_stage
Allowed values ONLY:
- `INIT`
- `READY`
- `A`
- `B`
- `C`
- `D`

### 3.2 execution_state
Allowed values ONLY:
- `IDLE`
- `RUNNING`
- `BLOCKED`
- `ABORTED`
- `COMPLETE`

---

## 4. Deterministic Write Rules

### 4.1 Whole-file replacement
Each status update MUST overwrite the full file content (no partial patches).

### 4.2 Canonical formatting
Status MUST be written as valid JSON.

No comments.
No trailing commas.
UTF-8 encoding.

### 4.3 No narrative authority
No free-form narrative is permitted inside any field that can introduce interpretation.

Fields must remain structural and execution-directed.

---

## 5. Blocking Rules (Minimal)

### 5.1 BLOCKED state requirements
If `execution_state` is `BLOCKED`:
- `blocking_questions` MUST contain exactly ONE question string
- `next_step` MUST be an empty string

### 5.2 ABORTED state requirements
If `execution_state` is `ABORTED`:
- `blocking_questions` MUST be an empty array
- `next_step` MUST be an empty string

---

## 6. Progress Percent Rules (Minimal)

- `progress_percent` MUST be between 0 and 100 inclusive.
- The orchestrator MUST NOT estimate progress.
- Progress updates MUST be driven only by explicit stage gates defined elsewhere.

This spec does not define percent mapping.

---

## 7. Traceability

Every status update MUST be traceable to:
- the current task id
- the last produced authoritative artifact path (if any)

---

## 8. Out of Scope

- Writing any other files
- Decision logging
- Boundary audit execution
- Stage A/B/C/D logic
- Retry/rollback logic

---

END
