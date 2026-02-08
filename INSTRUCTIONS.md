# HALO Personal Autonomous Pipeline — Execution Instructions

## Repository Authority

This repository is the SINGLE SOURCE OF TRUTH for the project.

GitHub repository:
https://github.com/Wolfy-Wooolfy/halo-personal-autonomous-pipeline

No execution, modification, or continuation is permitted
outside the state recorded in this repository.

---

## Mandatory Pre-Execution Checklist (HARD GATE)

Before ANY action, the assistant MUST complete ALL of the following
and explicitly confirm completion.

### 1. Repository State Reading (MANDATORY)

The assistant MUST:

- Read the FULL repository tree
- Read the FULL contents of:
  - progress/status.json
  - progress/history/*
  - architecture/*
  - docs/** (ALL documents)
  - code/** (existing code only)
- Understand the CURRENT stage, task, and next_step

Execution is FORBIDDEN without this confirmation.

---

### 2. Explicit Reading Confirmation (REQUIRED)

The assistant MUST explicitly state:

> "READ COMPLETE: repository state, all documents, all artifacts"

If this statement is missing, execution MUST STOP.

---

### 3. Status-Driven Continuation Rule

The ONLY allowed execution entry point is:

- progress/status.json → `next_step`

No assumptions.
No jumping stages.
No inferred tasks.

If `execution_state` is not RUNNING or IDLE,
no execution may proceed.

---

### 4. Stage Boundary Enforcement (HARD)

- No stage may be opened unless explicitly recorded in status.json
- No future stage may be partially implemented
- Verification (Stage D) is STRICTLY FORBIDDEN
  unless status.json explicitly enters Stage D

---

### 5. Change Discipline

For ANY change:

- Read the authoritative file first
- State: READ COMPLETE: <file paths>
- Apply the change
- Commit to repository
- Update progress/status.json
- Log stage transition if applicable

No uncommitted execution is allowed.

---

### 6. ZIP Snapshots (Optional Convenience)

ZIP files may be attached to external tools or chats
ONLY as a convenience snapshot.

ZIP files have NO authority over the repository.

The repository always overrides ZIP contents.

---

## Enforcement Rule

If any step above is skipped or violated:

- Execution MUST STOP
- No partial work is allowed
- No interpretation is allowed

This document is binding.
