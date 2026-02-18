#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const { run } = require("../code/src/orchestrator/runner");

const STATUS_PATH = path.resolve(__dirname, "..", "progress", "status.json");

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

function fail(msg) {
  console.error(`[FORGE AUTONOMY STEP] ABORT: ${msg}`);
  process.exit(1);
}

function parseMaxSteps() {
  const v =
    process.env.FORGE_MAX_STEPS !== undefined
      ? process.env.FORGE_MAX_STEPS
      : process.env.HALO_MAX_STEPS;

  const raw = String(v || "").trim();

  if (raw === "") {
    return 1;
  }

  const n = Number(raw);

  if (!Number.isInteger(n) || n < 1) {
    fail("FORGE_MAX_STEPS (or HALO_MAX_STEPS) must be an integer >= 1");
  }

  return n;
}

function allowPostStageCompletion(status) {
  const t = String(status.current_task || "");
  const ns = String(status.next_step || "");
  return /\bTASK-040\b/.test(t) || /\bTASK-040\b/.test(ns);
}

function allowPostStageTasksAt100(status) {
  if (status.current_stage !== "D") {
    return false;
  }

  if (status.stage_progress_percent !== 100) {
    return false;
  }

  if (String(process.env.HALO_ALLOW_POST_STAGE_TASKS || "") !== "1") {
    return false;
  }

  const t = String(status.current_task || "").trim();
  return t !== "";
}

function mustStop(status) {
  if (Array.isArray(status.blocking_questions) && status.blocking_questions.length > 0) {
    return "BLOCKED state present (blocking_questions not empty)";
  }

  if (typeof status.next_step !== "string" || status.next_step.trim() === "" || /^IDLE/i.test(status.next_step.trim())) {
    return "next_step is IDLE/empty; nothing to run";
  }

  const target = extractTargetStage(status.next_step);

  if (!target) {
    return "next_step does not contain a Stage target";
  }

  if (target === "D" && process.env.HALO_ALLOW_STAGE_D !== "1") {
    return "Stage D invocation is forbidden in autonomy-step (set HALO_ALLOW_STAGE_D=1 to proceed)";
  }

  if (typeof status.stage_progress_percent === "number" && status.stage_progress_percent === 100) {
    if (allowPostStageTasksAt100(status)) {
      return null;
    }
    if (allowPostStageCompletion(status)) {
      return null;
    }
    return "stage_progress_percent == 100; stage is complete";
  }

  return null;
}

function isIdempotencyViolation(err) {
  if (!err) {
    return false;
  }

  const msg = String(err.message || err);

  return msg.startsWith("Idempotency violation:");
}

function main() {
  const autonomy =
    process.env.FORGE_AUTONOMY !== undefined
      ? process.env.FORGE_AUTONOMY
      : process.env.HALO_AUTONOMY;

  if (String(autonomy) !== "1") {
    fail("FORGE_AUTONOMY=1 (or HALO_AUTONOMY=1) is required");
  }

  const maxSteps = parseMaxSteps();

  console.log("[FORGE AUTONOMY STEP] START");
  console.log(`[FORGE AUTONOMY STEP] max_steps=${maxSteps}`);

  for (let i = 1; i <= maxSteps; i++) {
    const status = loadStatus();

    const stopReason = mustStop(status);
    if (stopReason) {
      console.log(`[FORGE AUTONOMY STEP] STOP at step ${i}: ${stopReason}`);
      console.log("[FORGE AUTONOMY STEP] DONE (bounded multi-step)");
      process.exit(0);
    }

    console.log(`[FORGE AUTONOMY STEP] step=${i}`);
    console.log(`[FORGE AUTONOMY STEP] next_step="${status.next_step}"`);

    try {
      run();
    } catch (err) {
      if (isIdempotencyViolation(err)) {
        console.log(`[FORGE AUTONOMY STEP] STOP at step ${i}: ${String(err.message || err)}`);
        console.log("[FORGE AUTONOMY STEP] DONE (bounded multi-step)");
        process.exit(0);
      }

      throw err;
    }
  }

  console.log("[FORGE AUTONOMY STEP] DONE (bounded multi-step)");
  process.exit(0);
}

main();
