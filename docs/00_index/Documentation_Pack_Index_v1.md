# 📄 Documentation Pack Index v1
**Document ID:** DOC-19  
**Status:** EXECUTION-BOUND  
**Scope:** Canonical Documentation Registry  
**Applies To:** Entire Personal Autonomous Pipeline  
**Enforcement Level:** HARD (Fail-Closed)

---

## 1. Purpose

This index is the canonical registry of all documents and schemas that hold
execution authority or enforceable governance within this repository.

It exists to:

- Eliminate document discovery ambiguity
- Provide a single entry point for audits
- Declare binding vs reference-only documents
- Declare supersession rules (v1 → v2)
- Lock naming + ID rules

If this index is missing, incomplete, or outdated:
→ Execution MUST enter BLOCKED state.

---

## 2. Authority Resolution

Authority hierarchy is defined in:

- docs/04_autonomy/Artifact_Authority_Hierarchy_Specification.md (DOC-11)

All conflicts MUST be resolved by DOC-11.

---

## 3. Binding vs Reference-Only

### 3.1 Reference-Only (No Execution Authority)
- docs/01_system/01_project_vision_reference.md (DOC-01) — Vision baseline only

### 3.2 Execution-Bound (HARD)
All documents listed in Sections 4–10 are execution-bound unless explicitly labeled reference-only.

---

## 4. Canonical Core Pack (Foundations)

- docs/01_system/01_System_Overview_and_Operating_Model.md
- docs/02_scope/02_Scope_and_Success_Contract.md
- docs/04_autonomy/04_Autonomy_Policy_and_Human_Interrupt_Protocol.md
- docs/05_artifacts/05_Artifact_Schema_and_Repository_Layout_Standard.md
- docs/06_progress/06_Progress_Tracking_and_Status_Report_Contract_v1.md
- docs/07_decisions/07_Decision_Logging_and_Change_Traceability_Specification.md
- docs/08_audit/08_HALO_Boundary_Audit_Rules_Fail-Closed_Pack.md
- docs/09_verify/09_Build_and_Verify_Playbook_Local.md
- docs/10_runtime/10_Tech_Assumptions_and_Local_Runtime_Setup.md

Notes:
- Some of the above may be partially superseded by v2 revisions (see Section 11),
  but remain binding where not superseded.

---

## 5. Pipeline Stage & Cognitive Loop Contracts (v1)

- docs/03_pipeline/03_Pipeline_Stages_Specification_A–D.md
- docs/03_pipeline/11_Idea_Evaluation_and_Finalization_Contract.md
- docs/03_pipeline/12_Documentation_Gap_Detection_and_Refinement_Loop_Contract.md
- docs/03_pipeline/13_Code_to_Documentation_Trace_and_Consistency_Contract.md
- docs/03_pipeline/14_Final_Acceptance_and_Release_Gate_Contract.md
- docs/03_pipeline/15_Cognitive_Lifecycle_Orchestration_Specification.md
- docs/03_pipeline/20_AI_Cognitive_Loop_Execution_Contract.md
- docs/03_pipeline/21_Candidate_Transformation_and_Authority_Separation_Contract.md

---

## 6. Cross-Document Consistency & Validators (v1)

- docs/09_verify/17_Cross_Document_Consistency_Review_Contract.md
- docs/09_verify/18_Code_to_Spec_Trace_Validator_Contract.md
- docs/09_verify/19_Docs_Gap_Analyzer_Validator_Contract.md

---

## 7. Vision Alignment Pack (Execution-Bound Audits)

- docs/01_system/02_Vision_and_Cognitive_Layer_Reference.md
- docs/08_audit/vision_alignment_contract.md

---

## 8. v2 Addendum (New Execution-Bound Canonical Documents)

### 8.1 Governance & Cognitive Layer (v2)
- docs/04_autonomy/Artifact_Authority_Hierarchy_Specification.md (DOC-11)
- docs/04_autonomy/Cognitive_Layer_Contract.md (DOC-12)

### 8.2 Loop & Stage Rebinding (v2)
- docs/03_pipeline/Loop_Enforcement_Specification.md (DOC-13)
- docs/03_pipeline/Stage_Contracts_Revision_v2.md (DOC-14)

### 8.3 Vision Compliance Enforcement (v2)
- docs/02_scope/Vision_Coverage_Matrix_Contract.md (DOC-15)
- docs/02_scope/Vision_Gap_Detection_Specification.md (DOC-16)

### 8.4 Artifact Schema (v2)
- docs/05_artifacts/Artifact_Schema_Revision_v2.md (DOC-17)

### 8.5 Progress Contract (v2)
- docs/06_progress/Progress_Contract_Revision_v2.md (DOC-18)

---

## 9. Machine-Verifiable Schemas (Canonical)

### 9.1 Progress
- docs/06_progress/status_schema_v2.json (SCHEMA-01)

### 9.2 Task Artifacts
- docs/05_artifacts/task_artifact_schema_v1.json (SCHEMA-02)

### 9.3 Stage C Verification
- docs/09_verify/trace_matrix_schema_v1.json (SCHEMA-03)
- docs/09_verify/mismatch_report_schema_v1.json (SCHEMA-04)
- docs/09_verify/verification_evidence_schema_v1.json (SCHEMA-05)

---

## 10. ID & Naming Rules (Hard)

### 10.1 Document ID Rule
If a document declares a Document ID inside its header, it MUST be unique.

If a document does not declare an ID, it is still binding if listed in this index,
but is treated as "legacy-unkeyed" and may not be referenced by ID-only rules.

### 10.2 Schema ID Rule
Schemas MUST have stable schema IDs (SCHEMA-XX) and stable file paths.

### 10.3 Filename Character Rule (Portability)
All canonical filenames MUST be ASCII-safe.

Non-ASCII punctuation (example: en dash "–") is prohibited in canonical filenames.

If present:
→ file must be renamed per Section 12.

---

## 11. Supersession Map (v1 → v2)

This section declares which v2 documents override which aspects of v1.

- DOC-11 overrides conflict resolution across all packs
- DOC-12 governs Cognitive Layer execution units (tasks/validators) where v1 is silent
- DOC-13 governs loop closure and gating for A/B/C where older docs are ambiguous
- DOC-14 defines stage closure conditions for A/B/C/D where older stage definitions conflict
- DOC-17 extends artifact schema to formally recognize TASK-layer artifacts
- DOC-18 governs status.json progress rules where v1 status contract is insufficient

Where not explicitly superseded:
v1 documents remain binding.

---

## 12. Required Naming Normalization Plan (Hard)

The following file currently violates Section 10.3:

- docs/03_pipeline/03_Pipeline_Stages_Specification_A–D.md

Required rename target (ASCII-safe):
- docs/03_pipeline/03_Pipeline_Stages_Specification_A-D.md

After rename:
- any references must be updated to the new path

This rename is mandatory for canonical compliance.

---

## 13. Update Policy

This index MUST be updated when:

- A new execution-bound document is introduced
- A contract revision changes authority meaning
- A schema revision is introduced
- Any canonical file is renamed or relocated

Failure to update:
→ Governance violation
→ Execution MUST enter BLOCKED

---

**END OF DOCUMENT**