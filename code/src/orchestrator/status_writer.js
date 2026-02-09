const fs = require("fs");
const path = require("path");

const STATUS_PATH = path.resolve(__dirname, "../../..", "progress", "status.json");

const ALLOWED_STAGES = ["INIT", "READY", "A", "B", "C", "D"];

function validatePayload(payload) {
  const keys = [
    "status_type",
    "current_stage",
    "overall_progress_percent",
    "stage_progress_percent",
    "last_completed_artifact",
    "current_task",
    "issues",
    "blocking_questions",
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

  if (payload.status_type !== "LIVE") {
    throw new Error("Invalid status_type");
  }

  if (!ALLOWED_STAGES.includes(payload.current_stage)) {
    throw new Error("Invalid current_stage");
  }

  if (!Number.isInteger(payload.overall_progress_percent)) {
    throw new Error("overall_progress_percent must be integer");
  }

  if (payload.overall_progress_percent < 0 || payload.overall_progress_percent > 100) {
    throw new Error("overall_progress_percent out of range");
  }

  if (!Number.isInteger(payload.stage_progress_percent)) {
    throw new Error("stage_progress_percent must be integer");
  }

  if (payload.stage_progress_percent < 0 || payload.stage_progress_percent > 100) {
    throw new Error("stage_progress_percent out of range");
  }

  if (typeof payload.last_completed_artifact !== "string") {
    throw new Error("last_completed_artifact must be string");
  }

  if (typeof payload.current_task !== "string") {
    throw new Error("current_task must be string");
  }

  if (!Array.isArray(payload.issues)) {
    throw new Error("issues must be array");
  }

  if (!Array.isArray(payload.blocking_questions)) {
    throw new Error("blocking_questions must be array");
  }

  if (payload.blocking_questions.length > 1) {
    throw new Error("blocking_questions must contain 0 or 1 item");
  }

  if (payload.blocking_questions.length === 1) {
    if (typeof payload.blocking_questions[0] !== "string" || payload.blocking_questions[0].trim() === "") {
      throw new Error("blocking_questions[0] must be a non-empty string");
    }
    if (payload.next_step !== "") {
      throw new Error("BLOCKED requires empty next_step");
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
