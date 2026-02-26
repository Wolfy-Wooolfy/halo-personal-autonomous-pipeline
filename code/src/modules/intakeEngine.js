const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function sha256Buffer(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function sha256File(absPath) {
  const data = fs.readFileSync(absPath);
  return sha256Buffer(data);
}

function isExcluded(relPath) {
  const p = relPath.replace(/\\/g, "/");

  if (p === ".git" || p.startsWith(".git/")) return true;
  if (p === "node_modules" || p.startsWith("node_modules/")) return true;

  if (p === "artifacts/intake" || p.startsWith("artifacts/intake/")) return true;

  return false;
}

function walk(rootAbs, relBase) {
  const abs = path.join(rootAbs, relBase);
  const st = fs.statSync(abs);

  const items = [];

  if (st.isDirectory()) {
    const children = fs.readdirSync(abs).sort((a, b) => a.localeCompare(b));
    for (const name of children) {
      const childRel = relBase ? path.join(relBase, name) : name;
      const normalized = childRel.replace(/\\/g, "/");
      if (isExcluded(normalized)) {
        continue;
      }
      items.push(...walk(rootAbs, childRel));
    }

    if (relBase) {
      const normalizedDir = relBase.replace(/\\/g, "/");
      if (!isExcluded(normalizedDir)) {
        items.push({
          path: normalizedDir.endsWith("/") ? normalizedDir : `${normalizedDir}/`,
          type: "dir",
          size_bytes: 0,
          hash: sha256Buffer(Buffer.from("")),
          captured_at: "SNAPSHOT_LOCKED"
        });
      }
    }

    return items;
  }

  const normalizedFile = relBase.replace(/\\/g, "/");
  if (isExcluded(normalizedFile)) {
    return [];
  }

  items.push({
    path: normalizedFile,
    type: "file",
    size_bytes: st.size,
    hash: sha256File(abs),
    captured_at: "SNAPSHOT_LOCKED"
  });

  return items;
}

function classifyState(rootAbs) {
  const hasDocs = fs.existsSync(path.join(rootAbs, "docs")) && fs.statSync(path.join(rootAbs, "docs")).isDirectory();
  const hasCode = fs.existsSync(path.join(rootAbs, "code")) && fs.statSync(path.join(rootAbs, "code")).isDirectory();
  const hasArtifacts = fs.existsSync(path.join(rootAbs, "artifacts")) && fs.statSync(path.join(rootAbs, "artifacts")).isDirectory();
  const hasStatus = fs.existsSync(path.join(rootAbs, "progress", "status.json"));

  if (!hasDocs && !hasCode && !hasArtifacts && !hasStatus) return { classification: "IDEA_ONLY", rules: ["no docs/", "no code/", "no artifacts/", "no progress/status.json"] };
  if (hasDocs && !hasCode) return { classification: "DOCS_ONLY", rules: ["docs/ present", "code/ missing"] };
  if (hasCode && !hasDocs) return { classification: "CODE_ONLY", rules: ["code/ present", "docs/ missing"] };
  if (hasDocs && hasCode && !hasArtifacts && !hasStatus) return { classification: "DOCS_AND_CODE", rules: ["docs/ present", "code/ present", "no active artifacts state"] };
  if (hasDocs && hasCode && hasArtifacts && hasStatus) return { classification: "FULL_PIPELINE_STATE", rules: ["docs/ present", "code/ present", "artifacts/ present", "progress/status.json present"] };

  return { classification: "DOCS_AND_CODE", rules: ["fallback structural match"] };
}

function renderEntrypointClassificationMd(payload) {
  const rules = payload.rules_triggered.map((r) => `- ${r}`).join("\n");
  const comps = payload.observed_components.map((c) => `- ${c}`).join("\n");
  const validations = payload.validation_summary.map((v) => `- ${v}`).join("\n");

  return `# entrypoint_classification

## Classification
- result: ${payload.classification}

## Rules Triggered
${rules}

## Observed Components
${comps}

## Intake Validation Summary
${validations}

## Deterministic Confirmation
- SNAPSHOT_LOCKED: true
- inventory_sorted: true
- hash_algorithm: sha256
`;
}

function ensureDir(absDir) {
  fs.mkdirSync(absDir, { recursive: true });
}

function writeJson(absPath, obj) {
  fs.writeFileSync(absPath, JSON.stringify(obj, null, 2), "utf-8");
}

function runIntake(context) {
  if (!context || typeof context !== "object") {
    throw new Error("Intake requires context object");
  }

  const rootAbs = path.resolve(__dirname, "../../..");
  const artifactsAbs = path.join(rootAbs, "artifacts", "intake");
  ensureDir(artifactsAbs);

  const classificationInfo = classifyState(rootAbs);

  const entries = walk(rootAbs, "");
  const normalized = entries
    .map((e) => Object.assign({}, e, { path: String(e.path || "").replace(/\\/g, "/") }))
    .sort((a, b) => a.path.localeCompare(b.path));

  let totalFiles = 0;
  let totalDirs = 0;
  for (const e of normalized) {
    if (e.type === "file") totalFiles += 1;
    if (e.type === "dir") totalDirs += 1;
  }

  const repoInventoryRel = "artifacts/intake/repository_inventory.json";
  const intakeSnapshotRel = "artifacts/intake/intake_snapshot.json";
  const entrypointRel = "artifacts/intake/entrypoint_classification.md";

  const inventoryPayload = normalized.map((e) => ({
    path: e.path,
    size_bytes: e.size_bytes,
    hash: e.hash,
    captured_at: e.captured_at
  }));

  const repositoryRootHash = sha256Buffer(Buffer.from(JSON.stringify(inventoryPayload)));

  writeJson(path.join(rootAbs, repoInventoryRel), inventoryPayload);

  const snapshotPayload = {
    module: "INTAKE",
    generated_at: new Date().toISOString(),
    total_files: totalFiles,
    total_directories: totalDirs,
    classification: classificationInfo.classification,
    repository_root_hash: repositoryRootHash,
    locked_snapshot_flag: true
  };

  writeJson(path.join(rootAbs, intakeSnapshotRel), snapshotPayload);

  const entryMd = renderEntrypointClassificationMd({
    classification: classificationInfo.classification,
    rules_triggered: classificationInfo.rules,
    observed_components: [
      fs.existsSync(path.join(rootAbs, "docs")) ? "docs/" : "docs/ (missing)",
      fs.existsSync(path.join(rootAbs, "code")) ? "code/" : "code/ (missing)",
      fs.existsSync(path.join(rootAbs, "artifacts")) ? "artifacts/" : "artifacts/ (missing)",
      fs.existsSync(path.join(rootAbs, "progress", "status.json")) ? "progress/status.json" : "progress/status.json (missing)"
    ],
    validation_summary: [
      "repository readable",
      "inventory generated",
      "inventory sorted lexicographically by path",
      "artifacts written under artifacts/intake/",
      "locked_snapshot_flag true"
    ]
  });

  fs.writeFileSync(path.join(rootAbs, entrypointRel), entryMd, "utf-8");

  return {
    stage_progress_percent: context.status && typeof context.status.stage_progress_percent === "number"
      ? context.status.stage_progress_percent
      : 0,
    artifact: intakeSnapshotRel,
    status_patch: {
      current_task: "MODULE: Audit",
      next_step: "MODULE_FLOW — next=Audit (set current_task to MODULE: Audit to continue)"
    },
    clear_current_task: false
  };
}

module.exports = {
  runIntake
};