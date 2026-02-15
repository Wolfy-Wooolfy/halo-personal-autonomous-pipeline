# 📄 Artifact Schema Revision v2
**Document ID:** DOC-17  
**Status:** EXECUTION-BOUND  
**Scope:** Artifact Types & Repository Layout Update  
**Applies To:** Entire Project  
**Enforcement Level:** HARD (Fail-Closed)

---

## 1. Purpose

This document updates the Artifact Schema
to formally include Task-level artifacts
as part of the official repository structure.

It aligns artifact governance with:

- DOC-11 (Authority Hierarchy)
- DOC-12 (Cognitive Layer)
- DOC-13 (Loop Enforcement)
- DOC-14 (Stage Contracts Revision)

---

## 2. Official Artifact Categories (Updated)

The project now recognizes five artifact categories:

1. Stage Artifacts
2. Task Artifacts
3. Coverage & Gap Artifacts
4. Verification Artifacts
5. Release Artifacts

Any artifact outside these categories:
→ Considered invalid.

---

## 3. Repository Layout (Revised)

Official layout:

artifacts/
│
├── stage_A/
├── stage_B/
├── stage_C/
├── stage_D/
│
├── tasks/
│   ├── TASK-XXX.execution.md
│   ├── TASK-XXX.closure.md
│   └── TASK-XXX.validation.md
│
├── coverage/
│   ├── vision_coverage_matrix.md
│   └── vision_gap_report.md
│
├── verification/
│   ├── trace_matrix.md
│   ├── mismatch_report.json
│   └── test_evidence.md
│
└── release/
    ├── deployment_record.md
    └── runtime_validation.md

Deviation from this layout:
→ Governance violation.

---

## 4. Task Artifact Definition

A Task Artifact MUST:

- Declare Task ID
- Declare Stage Binding
- Declare Contract Clauses Satisfied
- Declare Artifact Outputs
- Declare Closure Condition
- Declare Execution Result

Task Artifact types:

- Execution Artifact
- Validation Artifact
- Closure Artifact

A Task is NOT closed without a Closure Artifact.

---

## 5. Stage Artifact Definition

Stage Artifacts MUST include:

- Stage Closure Artifact
- Mandatory Loop Artifacts (per DOC-13)
- Verification linkage (if Stage C)

Stage cannot close based solely on Task artifacts.
Stage closure requires explicit Stage artifact.

---

## 6. Coverage Artifacts

Coverage folder MUST contain:

- Vision Coverage Matrix
- Vision Gap Report

If missing:
→ Vision compliance invalid.

---

## 7. Verification Artifacts (Stage C)

Verification folder MUST contain:

- Trace Matrix (Docs → Code)
- Mismatch Report (structured)
- Test Evidence

Stage C cannot close without these.

---

## 8. Artifact Identity Rules

Every artifact MUST:

- Have deterministic filename
- Be reproducible under same inputs
- Contain schema-bound structure
- Avoid narrative-only justification

Artifacts define state.
Logs do not.

---

## 9. Backward Compatibility Rule

Existing artifacts under artifacts/tasks/
are now officially recognized.

No migration required.

---

## 10. Enforcement Rule

Any artifact:

- Missing required fields
- Outside defined categories
- Closing Stage without loop compliance

→ Invalidates progress
→ Triggers BLOCKED state

Authority hierarchy per DOC-11 applies.

---

**END OF DOCUMENT**