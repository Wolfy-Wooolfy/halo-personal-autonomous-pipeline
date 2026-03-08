const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "../../..");

function sha256File(absPath) {
  const buf = fs.readFileSync(absPath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function ensureDir(absDir) {
  fs.mkdirSync(absDir, { recursive: true });
}

function runClosure(context) {
  const status = context && context.status ? context.status : context;

  const required = [
    "artifacts/execute/execute_plan.json",
    "artifacts/execute/execute_report.md",
    "artifacts/decisions/module_flow_decision_gate.json"
  ];

  const missing = required.filter((rel) => !fs.existsSync(path.resolve(ROOT, rel)));

  if (missing.length > 0) {
    return {
      stage_progress_percent: 100,
      blocked: true,
      status_patch: {
        next_step: "",
        blocking_questions: [
          `Closure BLOCKED: missing required artifacts -> ${missing.join(", ")}`
        ]
      }
    };
  }

  const closureDirAbs = path.resolve(ROOT, "artifacts", "closure");
  const releaseDirAbs = path.resolve(ROOT, "artifacts", "release");
  ensureDir(closureDirAbs);
  ensureDir(releaseDirAbs);

  const reportRel = "artifacts/closure/closure_report.md";
  const manifestRel = "artifacts/release/RELEASE_MANIFEST_v1.json";
  const hashesRel = "artifacts/release/repository_hash_snapshot.json";

  const reportAbs = path.resolve(ROOT, reportRel);
  const manifestAbs = path.resolve(ROOT, manifestRel);
  const hashesAbs = path.resolve(ROOT, hashesRel);

  const snapshot = required.map((rel) => {
    const abs = path.resolve(ROOT, rel);
    const st = fs.statSync(abs);
    return {
      path: rel,
      bytes: st.size,
      sha256: sha256File(abs)
    };
  });

  const manifest = {
    release_id: "MODULE_FLOW_RELEASE_v1",
    generated_at: new Date().toISOString(),
    stage: String(status && status.current_stage ? status.current_stage : ""),
    stage_progress_percent:
      typeof status && status.stage_progress_percent === "number"
        ? status.stage_progress_percent
        : null,
    last_completed_artifact: String(
      status && status.last_completed_artifact ? status.last_completed_artifact : ""
    ),
    source_artifacts: snapshot,
    outcome: "CLOSED",
    next_state: "READY"
  };

  fs.writeFileSync(manifestAbs, JSON.stringify(manifest, null, 2), { encoding: "utf8" });
  fs.writeFileSync(hashesAbs, JSON.stringify({ generated_at: manifest.generated_at, files: snapshot }, null, 2), {
    encoding: "utf8"
  });

  const md = [
    "# MODULE FLOW — Closure Report",
    "",
    `- generated_at: ${manifest.generated_at}`,
    `- outcome: CLOSED`,
    `- next_state: READY`,
    "",
    "## Verified Inputs",
    ...snapshot.map((x) => `- ${x.path} | bytes=${x.bytes} | sha256=${x.sha256}`),
    "",
    "## Outputs",
    `- ${reportRel}`,
    `- ${manifestRel}`,
    `- ${hashesRel}`,
    ""
  ].join("\n");

  fs.writeFileSync(reportAbs, md, { encoding: "utf8" });

  return {
    stage_progress_percent: 100,
    artifact: reportRel,
    outputs: {
      md: reportRel,
      manifest: manifestRel,
      hashes: hashesRel
    },
    status_patch: {
      blocking_questions: [],
      next_step: "READY — Module Flow Closure COMPLETE",
      issues: []
    }
  };
}

module.exports = {
  runClosure
};