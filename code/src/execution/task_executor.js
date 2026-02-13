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
  if (taskName.startsWith("SMOKE:")) {
    return;
  }

  if (!taskName.startsWith("TASK-")) {
    throw new Error("Unrecognized task namespace");
  }

  const taskPrefix = taskName.split(":")[0];
  const files = fs.readdirSync(TASKS_DIR);

  const matchingFile = files.find(file => file.startsWith(taskPrefix));

  if (!matchingFile) {
    throw new Error(`No contract artifact found for task: ${taskName}`);
  }
}

function findExistingClosureFile(taskName) {
  const taskPrefix = taskName.split(":")[0];
  const files = fs.readdirSync(TASKS_DIR);

  const closure = files.find(f =>
    f === `${taskPrefix}.execution.closure.md`
  );

  if (!closure) {
    return null;
  }

  return path.join(TASKS_DIR, closure);
}

function executeTask(taskName, context) {
  if (!taskName) {
    throw new Error("Cannot execute undefined task");
  }

  if (!context || typeof context !== "object") {
    throw new Error("Invalid execution context");
  }

  enforceTaskContract(taskName);

  if (taskName.startsWith("TASK-")) {
    const existingClosure = findExistingClosureFile(taskName);
    if (existingClosure) {
      throw new Error(`Idempotency violation: closure artifact already exists for ${taskName}`);
    }
  }

  const handler = getHandler(taskName);

  if (typeof handler !== "function") {
    throw new Error(`Invalid handler for task: ${taskName}`);
  }

  const frozenContext = Object.freeze({
    status: Object.freeze({ ...context })
  });

  const result = handler(frozenContext);

  validateExecutionResult(result);

  if (result.closure_artifact === true) {
    if (!result.artifact || typeof result.artifact !== "string") {
      throw new Error("closure_artifact requires artifact path");
    }

    if (!result.artifact.startsWith("artifacts/tasks/")) {
      throw new Error("closure_artifact artifact path must be under artifacts/tasks/");
    }

    const artifactAbs = path.resolve(__dirname, "../../..", result.artifact);

    if (fs.existsSync(artifactAbs)) {
      throw new Error("Artifact write protection: closure artifact already exists (no overwrite allowed)");
    }
  }

  return result;
}

module.exports = {
  executeTask
};
