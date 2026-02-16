# Stage C — Code Mismatch Report

~~~json
{
  "mismatch_report_id": "MISMATCH_REPORT_STAGE_C_v1",
  "generated_at": "2026-02-16T10:00:00Z",
  "trace_matrix_ref": "TRACE_MATRIX_STAGE_C_v1",
  "summary": {
    "must_missing_count": 0,
    "must_undocumented_count": 0,
    "should_missing_count": 0,
    "should_undocumented_count": 0,
    "unresolved_total": 1,
    "blocking": true
  },
  "mismatches": [
    {
      "mismatch_id": "MM-TRACE-001",
      "mismatch_type": "TRACE_GAP",
      "severity": "MUST",
      "requirement_level": "MUST",
      "description": "Trace matrix currently covers only Stage C output artifact requirements; Stage B requirement-by-clause mapping is not yet implemented.",
      "doc_refs": [
        {
          "path": "docs/03_pipeline/03_Pipeline_Stages_Specification_A-D.md",
          "anchor": "One-to-One Mapping Rule (Hard)"
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
      "status": "OPEN",
      "notes": "Next iteration should parse Stage B spec_pack_manifest.md and enumerate MUST clauses into the trace matrix rows."
    },
    {
      "mismatch_id": "MM-VERIF-001",
      "mismatch_type": "VERIFICATION_GAP",
      "severity": "MUST",
      "requirement_level": "MUST",
      "description": "Test evidence artifact generated but build/tests/lint/runtime smoke were not executed by the pipeline.",
      "doc_refs": [
        {
          "path": "docs/03_pipeline/03_Pipeline_Stages_Specification_A-D.md",
          "anchor": "test_evidence.md \u2014 test evidence containing"
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
      "status": "RESOLVED",
      "notes": "Resolved by TASK-034: artifacts/stage_C/test_evidence.md shows pre_run_check ran=true passed=true with captured output."
    }
  ]
}
~~~
