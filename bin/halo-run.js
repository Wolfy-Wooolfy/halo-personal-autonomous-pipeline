#!/usr/bin/env node

const { run } = require("../code/src/orchestrator/runner");

try {
  run();
  process.exit(0);
} catch (err) {
  console.error("HALO RUN ERROR:");
  console.error(err.message);
  process.exit(1);
}
