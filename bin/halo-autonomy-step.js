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
  console.error(`[HALO AUTONOMY STEP] ABORT: ${msg}`);
  process.exit(1);
}

function parseMaxSteps() {
  const raw = String(process.env.HALO_MAX_STEPS || "").trim();

  if (raw === "") {
    return 1;
  }

  const n = Number(raw);

  if (!Number.isInteger(n) || n < 1) {
    fail("HALO_MAX_STEPS must be an integer >= 1");
  }

  return n;
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

  if (target === "D") {
    return "Stage D invocation is forbidden in autonomy-step";
  }

  if (typeof status.stage_progress_percent === "number" && status.stage_progress_percent === 100) {
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
  if (String(process.env.HALO_AUTONOMY) !== "1") {
    fail("HALO_AUTONOMY=1 is required");
  }

  const maxSteps = parseMaxSteps();

  console.log("[HALO AUTONOMY STEP] START");
  console.log(`[HALO AUTONOMY STEP] max_steps=${maxSteps}`);

  for (let i = 1; i <= maxSteps; i++) {
    const status = loadStatus();

    const stopReason = mustStop(status);
    if (stopReason) {
      console.log(`[HALO AUTONOMY STEP] STOP at step ${i}: ${stopReason}`);
      console.log("[HALO AUTONOMY STEP] DONE (bounded multi-step)");
      process.exit(0);
    }

    console.log(`[HALO AUTONOMY STEP] step=${i}`);
    console.log(`[HALO AUTONOMY STEP] next_step="${status.next_step}"`);

    try {
      run();
    } catch (err) {
      if (isIdempotencyViolation(err)) {
        console.log(`[HALO AUTONOMY STEP] STOP at step ${i}: ${String(err.message || err)}`);
        console.log("[HALO AUTONOMY STEP] DONE (bounded multi-step)");
        process.exit(0);
      }

      throw err;
    }
  }

  console.log("[HALO AUTONOMY STEP] DONE (bounded multi-step)");
  process.exit(0);
}

main();
