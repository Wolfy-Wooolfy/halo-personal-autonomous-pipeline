const fs = require("fs");
const path = require("path");

const STATUS_PATH = path.resolve(__dirname, "../../..", "progress", "status.json");

const ALLOWED_STAGES = ["INIT", "READY", "A", "B", "C", "D"];
const ALLOWED_EXECUTION_STATES = ["IDLE", "RUNNING", "BLOCKED", "ABORTED", "COMPLETE"];

function validatePayload(payload) {
  const keys = [
    "current_stage",
    "execution_state",
    "progress_percent",
    "last_artifact",
    "current_task",
    "blocking_questions",
    "issues",
    "next_step"
  ];

  const payloadKeys = Object.keys(payload);

  if (payloadKeys.length !== keys.length) {
    throw new Error("Invalid status schema");
  }

  for (const key of keys) {
    if (!payloadKeys.includes(key)) {
      throw new Error("Missing status field");
    }
  }

  if (!ALLOWED_STAGES.includes(payload.current_stage)) {
    throw new Error("Invalid current_stage");
  }

  if (!ALLOWED_EXECUTION_STATES.includes(payload.execution_state)) {
    throw new Error("Invalid execution_state");
  }

  if (typeof payload.progress_percent !== "number") {
    throw new Error("Invalid progress_percent");
  }

  if (payload.progress_percent < 0 || payload.progress_percent > 100) {
    throw new Error("progress_percent out of range");
  }

  if (!Array.isArray(payload.blocking_questions)) {
    throw new Error("blocking_questions must be array");
  }

  if (!Array.isArray(payload.issues)) {
    throw new Error("issues must be array");
  }

  if (payload.execution_state === "BLOCKED") {
    if (payload.blocking_questions.length !== 1) {
      throw new Error("BLOCKED requires exactly one blocking question");
    }
    if (payload.next_step !== "") {
      throw new Error("BLOCKED requires empty next_step");
    }
  }

  if (payload.execution_state === "ABORTED") {
    if (payload.blocking_questions.length !== 0) {
      throw new Error("ABORTED requires empty blocking_questions");
    }
    if (payload.next_step !== "") {
      throw new Error("ABORTED requires empty next_step");
    }
  }
}

function writeStatus(payload) {
  validatePayload(payload);

  const json = JSON.stringify(payload, null, 2);
  fs.writeFileSync(STATUS_PATH, json, { encoding: "utf8" });
}

module.exports = {
  writeStatus
};
