#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const { run } = require("../code/src/orchestrator/runner");

const STATUS_PATH = path.resolve(__dirname, "..", "progress", "status.json");

function loadStatus() {
  const raw = fs.readFileSync(STATUS_PATH, { encoding: "utf8" });
  return JSON.parse(raw);
}

function parseMaxSteps() {
  const arg = process.argv.find(a => a.startsWith("--max-steps="));
  if (!arg) return 1;

  const value = parseInt(arg.split("=")[1], 10);
  if (isNaN(value) || value <= 0) return 1;

  return value;
}

function shouldStop(status) {
  if (!status) return true;

  if (Array.isArray(status.blocking_questions) && status.blocking_questions.length > 0)
    return true;

  if (typeof status.next_step !== "string" || /^IDLE/i.test(status.next_step.trim()))
    return true;

  if (status.stage_progress_percent === 100)
    return true;

  return false;
}

try {
  const maxSteps = parseMaxSteps();

  for (let i = 0; i < maxSteps; i++) {
    run();

    const status = loadStatus();

    if (shouldStop(status)) {
      break;
    }
  }

  process.exit(0);

} catch (err) {
  console.error("FORGE RUN ERROR:");
  console.error(err.message);
  process.exit(1);
}