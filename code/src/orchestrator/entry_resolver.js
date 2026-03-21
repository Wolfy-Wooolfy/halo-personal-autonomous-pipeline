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

  return fs
    .readdirSync(TASKS_DIR)
    .filter((f) => f.endsWith(".execution.closure.md"))
    .map((f) => String(f || "").toUpperCase());
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

  return closureFiles.includes(`${taskId}.EXECUTION.CLOSURE.MD`);
}

function isBlockedStatus(status) {
  const blockingQuestions = Array.isArray(status.blocking_questions) ? status.blocking_questions : [];
  const issues = Array.isArray(status.issues) ? status.issues : [];
  const nextStep = String(status.next_step || "");

  if (blockingQuestions.length > 0) {
    return true;
  }

  if (issues.length > 0) {
    return true;
  }

  if (/^\s*BLOCKED\b/i.test(nextStep)) {
    return true;
  }

  return false;
}

function getContiguousClosedIndex(pipeline, closureFiles) {
  let lastClosedIndex = -1;

  for (let i = 0; i < pipeline.length; i += 1) {
    if (!isTaskClosed(pipeline[i].task_name, closureFiles)) {
      break;
    }
    lastClosedIndex = i;
  }

  return lastClosedIndex;
}

function hasLaterClosureAfterGap(pipeline, closureFiles, contiguousClosedIndex) {
  for (let i = contiguousClosedIndex + 1; i < pipeline.length; i += 1) {
    if (isTaskClosed(pipeline[i].task_name, closureFiles)) {
      return true;
    }
  }

  return false;
}

function resolveEntry() {
  const status = readStatus();
  const pipeline = getPipeline();
  const closureFiles = getClosureFiles();

  const contiguousClosedIndex = getContiguousClosedIndex(pipeline, closureFiles);
  const laterClosureAfterGap = hasLaterClosureAfterGap(pipeline, closureFiles, contiguousClosedIndex);



  if (laterClosureAfterGap) {
    return {
      entry_type: "BLOCKED",
      next_module: null,
      next_task: null,
      blocked: true,
      reason: "Invalid pipeline state: closure sequence contains a gap"
    };
  }

  const allClosed = contiguousClosedIndex === pipeline.length - 1;
  const statusTask = String(status.current_task || "").trim();
  const statusNextStep = String(status.next_step || "").trim();

  if (allClosed) {
    const statusLooksComplete = statusTask === "" && statusNextStep === "";

    if (!statusLooksComplete) {
      return {
        entry_type: "BLOCKED",
        next_module: null,
        next_task: null,
        blocked: true,
        reason: "Invalid pipeline state: pipeline closures indicate COMPLETE but status.json does not"
      };
    }

    return {
      entry_type: "COMPLETE",
      next_module: null,
      next_task: null,
      blocked: false,
      reason: "Pipeline already complete"
    };
  }

  if (isBlockedStatus(status)) {
    return {
      entry_type: "BLOCKED",
      next_module: null,
      next_task: null,
      blocked: true,
      reason: "Status is already BLOCKED"
    };
  }

  if (contiguousClosedIndex === -1) {
    if (statusTask !== "" && statusTask !== pipeline[0].task_name) {
      return {
        entry_type: "BLOCKED",
        next_module: null,
        next_task: null,
        blocked: true,
        reason: "Invalid pipeline state: status.json points to a mid-pipeline task without closure history"
      };
    }

    return {
      entry_type: "FRESH",
      next_module: pipeline[0].module_id,
      next_task: pipeline[0].task_name,
      blocked: false,
      reason: "Fresh pipeline start"
    };
  }

  const nextModule = pipeline[contiguousClosedIndex + 1];

  if (!nextModule) {
    return {
      entry_type: "BLOCKED",
      next_module: null,
      next_task: null,
      blocked: true,
      reason: "Invalid pipeline state: next module could not be resolved"
    };
  }

  if (statusTask !== "" && statusTask !== nextModule.task_name) {
    return {
      entry_type: "BLOCKED",
      next_module: null,
      next_task: null,
      blocked: true,
      reason: "Invalid pipeline state: status.json current_task does not match next deterministic task"
    };
  }

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
