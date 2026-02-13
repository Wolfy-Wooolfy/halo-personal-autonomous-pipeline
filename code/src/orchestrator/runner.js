const fs = require("fs");
const path = require("path");

const { validateTransition } = require("./stage_transitions");
const { writeStatus } = require("./status_writer");
const { executeTask } = require("../execution/task_executor");

const STATUS_PATH = path.resolve(__dirname, "../../..", "progress", "status.json");

function loadStatus() {
  const raw = fs.readFileSync(STATUS_PATH, { encoding: "utf8" });
  return JSON.parse(raw);
}

function extractTargetStage(nextStep) {
  if (typeof nextStep !== "string") {
    return null;
  }

  const match = nextStep.match(/Stage\s+([A-D])/i);
  if (!match) {
    return null;
  }

  return match[1].toUpperCase();
}

function isDryRun() {
  return String(process.env.HALO_DRY_RUN).toLowerCase() === "true";
}

function assertIdempotency(status) {
  if (
    status.stage_progress_percent === 100 &&
    typeof status.current_task === "string" &&
    status.current_task.trim() !== ""
  ) {
    throw new Error("Task already completed (idempotency guard)");
  }
}

function run() {
  const status = loadStatus();

  if (typeof status.current_task !== "string") {
    throw new Error("current_task must be string");
  }

  if (status.current_task.trim() === "") {
    console.log("[HALO] No task to execute.");
    return;
  }

  assertIdempotency(status);

  if (isDryRun()) {
    console.log("[HALO DRY-RUN]");
    console.log(`Would execute task: ${status.current_task}`);
    console.log("No state was written.");
    return;
  }

  const result = executeTask(status.current_task, status);

  if (!result || typeof result !== "object") {
    throw new Error("Task handler must return execution result object");
  }

  const updated = {
    ...status,
    stage_progress_percent: result.stage_progress_percent,
    last_completed_artifact: result.artifact || status.last_completed_artifact
  };

  writeStatus(updated);

  console.log(`[HALO] ${status.current_task} progressed stage to ${result.stage_progress_percent}%`);

  if (result.closure_artifact) {
    console.log(`[HALO] ${status.current_task} execution closure artifact created.`);
  }

  const targetStage = extractTargetStage(status.next_step);
  if (targetStage && targetStage !== status.current_stage) {
    validateTransition(status.current_stage, targetStage);

    const stageUpdated = {
      ...updated,
      current_stage: targetStage,
      stage_progress_percent: 0
    };

    writeStatus(stageUpdated);
  }
}

module.exports = {
  run
};