const fs = require("fs");
const path = require("path");
const { getPipeline } = require("./pipeline_definition");

const STATUS_PATH = path.join(process.cwd(), "progress", "status.json");
const TASKS_DIR = path.join(process.cwd(), "artifacts", "tasks");

function readStatus() {
  const raw = fs.readFileSync(STATUS_PATH, "utf8");
  return JSON.parse(raw);
}

function getClosureFiles() {
  if (!fs.existsSync(TASKS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(TASKS_DIR);

  return files.filter((f) => f.endsWith(".execution.closure.md"));
}

function extractTaskId(taskName) {
  const match = String(taskName || "").match(/TASK-\d+/i);
  return match ? match[0].toUpperCase() : "";
}

function isTaskClosed(taskName, closureFiles) {
  const taskId = extractTaskId(taskName);

  if (!taskId) {
    return false;
  }

  return closureFiles.some((f) => {
    return String(f || "").toUpperCase() === `${taskId}.EXECUTION.CLOSURE.MD`;
  });
}

function resolveEntry() {
  const status = readStatus();
  const pipeline = getPipeline();
  const closureFiles = getClosureFiles();

  const completedModules = [];

  for (const module of pipeline) {
    const closed = isTaskClosed(module.task_name, closureFiles);

    if (closed) {
      completedModules.push(module.module_id);
    } else {
      break;
    }
  }

  if (completedModules.length === pipeline.length) {
    return {
      entry_type: "COMPLETE",
      next_module: null,
      next_task: null,
      blocked: false,
      reason: "Pipeline already complete"
    };
  }

  if (completedModules.length === 0) {
    return {
      entry_type: "FRESH",
      next_module: pipeline[0].module_id,
      next_task: pipeline[0].task_name,
      blocked: false,
      reason: "Fresh pipeline start"
    };
  }

  const nextModule = pipeline[completedModules.length];

  return {
    entry_type: "RESUME",
    next_module: nextModule.module_id,
    next_task: nextModule.task_name,
    blocked: false,
    reason: "Resume from next incomplete module"
  };
}

module.exports = {
  resolveEntry
};