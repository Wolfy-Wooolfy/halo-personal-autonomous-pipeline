const fs = require("fs");
const path = require("path");

const { validateTransition } = require("./stage_transitions");
const { writeStatus } = require("./status_writer");

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

function run() {
  const status = loadStatus();

  const fromStage = status.current_stage;
  const targetStage = extractTargetStage(status.next_step);

  if (!targetStage) {
    return;
  }

  if (fromStage === targetStage) {
    if (isDryRun()) {
      console.log("[HALO DRY-RUN]");
      console.log(`Acknowledged internal step in Stage ${fromStage}`);
      console.log("No state was written.");
      return;
    }

    const updated = {
      ...status,
      stage_progress_percent: 100
    };

    writeStatus(updated);
    console.log(`[HALO] Internal step acknowledged in Stage ${fromStage}`);
    return;
  }

  validateTransition(fromStage, targetStage);

  if (isDryRun()) {
    console.log("[HALO DRY-RUN]");
    console.log(`Validated transition: ${fromStage} -> ${targetStage}`);
    console.log("No state was written.");
    return;
  }

  const updated = {
    ...status,
    current_stage: targetStage,
    stage_progress_percent: 0
  };

  writeStatus(updated);
}

module.exports = {
  run
};