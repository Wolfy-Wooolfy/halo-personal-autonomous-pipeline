#!/usr/bin/env node

const { runAutonomous } = require("../code/src/orchestrator/autonomous_runner");

Promise.resolve()
  .then(() => runAutonomous())
  .catch((error) => {
    console.error("FORGE AUTONOMOUS RUN ERROR:");
    console.error(error && error.message ? error.message : String(error));
    process.exit(1);
  });