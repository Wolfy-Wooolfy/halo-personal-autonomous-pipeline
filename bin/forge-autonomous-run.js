#!/usr/bin/env node

const { runAutonomous } = require("../code/src/orchestrator/autonomous_runner");
const { writeForgeState } = require("../code/src/forge/forge_state_writer");

function finalizeAndExit(error) {
  try {
    writeForgeState();
  } catch (stateError) {
    console.error("FORGE BUILD STATE WRITE ERROR:");
    console.error(stateError && stateError.message ? stateError.message : String(stateError));
  }

  if (error) {
    console.error("FORGE AUTONOMOUS RUN ERROR:");
    console.error(error && error.message ? error.message : String(error));
    process.exit(1);
  }
}

Promise.resolve()
  .then(() => {
    writeForgeState();
    return runAutonomous();
  })
  .then(() => {
    writeForgeState();
  })
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    finalizeAndExit(error);
  });