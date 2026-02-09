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

function main() {
  if (String(process.env.HALO_AUTONOMY) !== "1") {
    fail("HALO_AUTONOMY=1 is required");
  }

  const status = loadStatus();

  if (Array.isArray(status.blocking_questions) && status.blocking_questions.length > 0) {
    fail("BLOCKED state present (blocking_questions not empty)");
  }

  if (typeof status.next_step !== "string" || status.next_step.trim() === "" || /^IDLE/i.test(status.next_step.trim())) {
    fail("next_step is IDLE/empty; nothing to run");
  }

  const target = extractTargetStage(status.next_step);

  if (!target) {
    fail("next_step does not contain a Stage target");
  }

  if (target === "D") {
    fail("Stage D invocation is forbidden in autonomy-step");
  }

  console.log("[HALO AUTONOMY STEP] START");
  console.log(`[HALO AUTONOMY STEP] next_step="${status.next_step}"`);

  run();

  console.log("[HALO AUTONOMY STEP] DONE (single-step)");
  process.exit(0);
}

main();
