const fs = require("fs");
const path = require("path");
const { getHandler } = require("./task_registry");

const TASKS_DIR = path.resolve(__dirname, "../../..", "artifacts", "tasks");

function validateExecutionResult(result) {
  if (!result || typeof result !== "object") {
    throw new Error("Task handler must return result object");
  }

  if (typeof result.stage_progress_percent !== "number") {
    throw new Error("Execution result must include numeric stage_progress_percent");
  }

  if (result.stage_progress_percent < 0 || result.stage_progress_percent > 100) {
    throw new Error("stage_progress_percent must be between 0 and 100");
  }

  if (result.artifact && typeof result.artifact !== "string") {
    throw new Error("artifact must be string if provided");
  }

  if (result.closure_artifact && typeof result.closure_artifact !== "boolean") {
    throw new Error("closure_artifact must be boolean if provided");
  }
}

function enforceTaskContract(taskName) {
  // Allow internal smoke tasks
  if (taskName.startsWith("SMOKE:")) {
    return;
  }

  // Only enforce contract for TASK- prefixed tasks
  if (!taskName.startsWith("TASK-")) {
    throw new Error("Unrecognized task namespace");
  }

  const taskPrefix = taskName.split(":")[0];
  const files = fs.readdirSync(TASKS_DIR);

  const matchingFile = files.find(file =>
    file.startsWith(taskPrefix)
  );

  if (!matchingFile) {
    throw new Error(`No contract artifact found for task: ${taskName}`);
  }
}

function executeTask(taskName, context) {
  if (!taskName) {
    throw new Error("Cannot execute undefined task");
  }

  if (!context || typeof context !== "object") {
    throw new Error("Invalid execution context");
  }

  enforceTaskContract(taskName);

  const handler = getHandler(taskName);

  if (typeof handler !== "function") {
    throw new Error(`Invalid handler for task: ${taskName}`);
  }

  const frozenContext = Object.freeze({
    status: Object.freeze({ ...context })
  });

  const result = handler(frozenContext);

  validateExecutionResult(result);

  return result;
}

module.exports = {
  executeTask
};