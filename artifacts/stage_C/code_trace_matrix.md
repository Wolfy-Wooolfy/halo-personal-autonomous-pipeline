# Stage C — Code Trace Matrix

~~~json
{
  "trace_matrix_id": "TRACE_MATRIX_STAGE_C_v1",
  "generated_at": "2026-02-16T12:20:27.526Z",
  "source_docs": [
    "docs/03_pipeline/03_Pipeline_Stages_Specification_A-D.md",
    "docs/05_artifacts/Artifact_Schema_Revision_v2.md",
    "docs/05_artifacts/Artifact_Serialization_and_Embedded_JSON_Rule.md",
    "docs/09_verify/trace_matrix_schema_v1.json",
    "docs/09_verify/mismatch_report_schema_v1.json",
    "docs/09_verify/verification_evidence_schema_v1.json"
  ],
  "codebase_root": "code",
  "coverage_summary": {
    "must_total": 3,
    "must_covered": 3,
    "must_coverage_percent": 100,
    "should_total": 0,
    "should_covered": 0,
    "should_coverage_percent": 100,
    "unmapped_must_count": 0
  },
  "rows": [
    {
      "requirement_id": "STAGE_C.OUT.CODE_TRACE_MATRIX",
      "requirement_level": "MUST",
      "requirement_text": "Stage C MUST produce artifacts/stage_C/code_trace_matrix.md with embedded JSON conforming to SCHEMA-03.",
      "doc_refs": [
        {
          "path": "docs/03_pipeline/03_Pipeline_Stages_Specification_A-D.md",
          "anchor": "Stage C — Code Generation & Implementation"
        },
        {
          "path": "docs/05_artifacts/Artifact_Schema_Revision_v2.md",
          "anchor": "Stage C Verification Artifacts (Canonical Paths)"
        }
      ],
      "code_refs": [
        {
          "path": "code/src/execution/task_registry.js",
          "symbol": "TASK-033 handler",
          "lines": {
            "start": 194,
            "end": 213
          }
        }
      ],
      "verification_refs": [
        "artifacts/stage_C/code_trace_matrix.md"
      ],
      "status": "COVERED"
    },
    {
      "requirement_id": "STAGE_C.OUT.CODE_MISMATCH_REPORT",
      "requirement_level": "MUST",
      "requirement_text": "Stage C MUST produce artifacts/stage_C/code_mismatch_report.md with embedded JSON conforming to SCHEMA-04.",
      "doc_refs": [
        {
          "path": "docs/03_pipeline/03_Pipeline_Stages_Specification_A-D.md",
          "anchor": "Stage C — Code Generation & Implementation"
        },
        {
          "path": "docs/05_artifacts/Artifact_Schema_Revision_v2.md",
          "anchor": "Stage C Verification Artifacts (Canonical Paths)"
        }
      ],
      "code_refs": [
        {
          "path": "code/src/execution/task_registry.js",
          "symbol": "TASK-033 handler",
          "lines": {
            "start": 194,
            "end": 213
          }
        }
      ],
      "verification_refs": [
        "artifacts/stage_C/code_mismatch_report.md"
      ],
      "status": "COVERED"
    },
    {
      "requirement_id": "STAGE_C.OUT.TEST_EVIDENCE",
      "requirement_level": "MUST",
      "requirement_text": "Stage C MUST produce artifacts/stage_C/test_evidence.md with embedded JSON conforming to SCHEMA-05.",
      "doc_refs": [
        {
          "path": "docs/03_pipeline/03_Pipeline_Stages_Specification_A-D.md",
          "anchor": "Stage C — Code Generation & Implementation"
        },
        {
          "path": "docs/05_artifacts/Artifact_Schema_Revision_v2.md",
          "anchor": "Stage C Verification Artifacts (Canonical Paths)"
        },
        {
          "path": "docs/05_artifacts/Artifact_Serialization_and_Embedded_JSON_Rule.md",
          "anchor": "Embedded JSON"
        }
      ],
      "code_refs": [
        {
          "path": "code/src/execution/task_registry.js",
          "symbol": "TASK-033 handler",
          "lines": {
            "start": 194,
            "end": 213
          }
        }
      ],
      "verification_refs": [
        "artifacts/stage_C/test_evidence.md"
      ],
      "status": "COVERED"
    }
  ]
}
~~~
