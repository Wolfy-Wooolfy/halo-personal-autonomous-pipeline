const fs = require("fs");
const path = require("path");

const { writeStatus } = require(path.resolve(__dirname, "../../code/src/orchestrator/status_writer"));

const STATUS_PATH = path.resolve(__dirname, "../../progress/status.json");

function fail(msg) {
  throw new Error(msg);
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function run() {
  const original = fs.readFileSync(STATUS_PATH, { encoding: "utf8" });

  let wrote = false;

  try {
    const payload = {
      current_stage: "C",
      execution_state: "RUNNING",
      progress_percent: 46,
      last_artifact: "verify/smoke/status_writer_smoke.js",
      current_task: "TASK-001: Define orchestrator skeleton (deterministic stage runner) with status.json updates only",
      blocking_questions: [],
      issues: [],
      next_step: "Stage D: smoke test status_writer.writeStatus with a valid payload (verify/smoke/status_writer_smoke.js)"
    };

    writeStatus(payload);
    wrote = true;

    const after = fs.readFileSync(STATUS_PATH, { encoding: "utf8" });
    const parsed = JSON.parse(after);

    if (!deepEqual(parsed, payload)) {
      fail("SMOKE FAIL: status.json content mismatch after writeStatus");
    }

    console.log("SMOKE PASS: status_writer.writeStatus wrote valid payload");
  } finally {
    if (wrote) {
      fs.writeFileSync(STATUS_PATH, original, { encoding: "utf8" });
    }
  }
}

run();
