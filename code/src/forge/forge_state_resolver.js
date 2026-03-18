const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..", "..");
const TASKS_DIR = path.join(ROOT, "artifacts", "tasks");
const REGISTRY_PATH = path.join(ROOT, "code", "src", "execution", "task_registry.js");

function loadRegistryModule() {
  delete require.cache[require.resolve(REGISTRY_PATH)];
  const registry = require(REGISTRY_PATH);

  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    throw new Error("INVALID TASK REGISTRY EXPORT");
  }

  return registry;
}

function extractOrderedTaskNamesFromRegistry() {
  const registry = loadRegistryModule();
  const taskNames = Object.keys(registry).filter((key) => key.startsWith("TASK-"));

  if (taskNames.length === 0) {
    throw new Error("NO TASKS FOUND IN TASK REGISTRY");
  }

  return taskNames.sort((a, b) => {
    return extractTaskNumber(a) - extractTaskNumber(b);
  });
}

function extractTaskNumber(value) {
  const match = String(value).match(/TASK-(\d+)/);

  if (!match) {
    throw new Error(`INVALID TASK IDENTIFIER: ${value}`);
  }

  return Number(match[1]);
}

function listTaskArtifactFiles() {
  if (!fs.existsSync(TASKS_DIR)) {
    throw new Error("TASKS DIRECTORY NOT FOUND");
  }

  return fs.readdirSync(TASKS_DIR);
}

function listClosureFiles() {
  return listTaskArtifactFiles().filter((file) => file.endsWith(".execution.closure.md"));
}

function extractTaskIdFromArtifact(fileName) {
  const match = String(fileName).match(/^(TASK-\d+)/);

  if (!match) {
    throw new Error(`INVALID TASK ARTIFACT NAME: ${fileName}`);
  }

  return match[1];
}

function buildClosureMap(closureFiles) {
  const closureMap = new Map();

  for (const file of closureFiles) {
    const taskId = extractTaskIdFromArtifact(file);

    if (closureMap.has(taskId)) {
      throw new Error(`DUPLICATE CLOSURE ARTIFACT FOR ${taskId}`);
    }

    closureMap.set(taskId, file);
  }

  return closureMap;
}

function findStageArtifactForTask(taskId, allFiles) {
  const preferredOrder = [".stageA.", ".stageB.", ".stageC.", ".stageD."];

  for (const marker of preferredOrder) {
    const found = allFiles.find((file) => file.startsWith(`${taskId}${marker}`));
    if (found) {
      return found;
    }
  }

  return null;
}

function deriveStageFromTask(taskId, allFiles) {
  if (!taskId) {
    return null;
  }

  const artifactFile = findStageArtifactForTask(taskId, allFiles);

  if (!artifactFile) {
    return null;
  }

  if (artifactFile.includes(".stageA.")) return "A";
  if (artifactFile.includes(".stageB.")) return "B";
  if (artifactFile.includes(".stageC.")) return "C";
  if (artifactFile.includes(".stageD.")) return "D";

  return null;
}

function buildConsistentState(taskNames, closureMap, allFiles) {
  const closedTasks = [];
  const openTasks = [];
  const pendingGaps = [];

  let firstOpenEncountered = false;

  for (const taskName of taskNames) {
    const taskId = extractTaskIdFromArtifact(taskName);
    const isClosed = closureMap.has(taskId);

    if (isClosed && firstOpenEncountered) {
      return buildInconsistentState(
        "CLOSURE_CONTINUITY_BROKEN",
        `Closed task found after open task: ${taskId}`
      );
    }

    if (isClosed) {
      closedTasks.push(taskId);
      continue;
    }

    firstOpenEncountered = true;
    openTasks.push(taskId);

    const hasStageArtifact = Boolean(findStageArtifactForTask(taskId, allFiles));

    if (hasStageArtifact) {
      pendingGaps.push(`${taskId}: OPEN_WITHOUT_EXECUTION_CLOSURE`);
    } else {
      pendingGaps.push(`${taskId}: MISSING_STAGE_ARTIFACTS_AND_CLOSURE`);
    }
  }

  const lastCompletedTaskId =
    closedTasks.length > 0 ? closedTasks[closedTasks.length - 1] : null;

  const currentTask =
    openTasks.length > 0 ? openTasks[0] : null;

  const currentStage = deriveStageFromTask(currentTask, allFiles);

  const buildProgressPercent =
    taskNames.length === 0
      ? 0
      : Math.round((closedTasks.length / taskNames.length) * 100);

  return {
    status_type: "FORGE_BUILD_STATE",
    current_stage: currentStage,
    current_task: currentTask,
    last_completed_artifact: lastCompletedTaskId
      ? `artifacts/tasks/${lastCompletedTaskId}.execution.closure.md`
      : "",
    closed_tasks: closedTasks,
    open_tasks: openTasks,
    pending_gaps: pendingGaps,
    build_progress_percent: buildProgressPercent,
    execution_integrity: "CONSISTENT",
    next_allowed_step: currentTask
      ? `artifacts/tasks/${currentTask}.stageA.*`
      : "COMPLETE",
    derived_from: {
      registry: "code/src/execution/task_registry.js",
      task_artifacts_directory: "artifacts/tasks",
      closure_artifacts: Array.from(closureMap.values()).map(
        (file) => `artifacts/tasks/${file}`
      )
    },
    derived_at: new Date().toISOString()
  };
}

function buildInconsistentState(code, reason) {
  return {
    status_type: "FORGE_BUILD_STATE",
    current_stage: null,
    current_task: "",
    last_completed_artifact: "",
    closed_tasks: [],
    open_tasks: [],
    pending_gaps: [],
    build_progress_percent: 0,
    execution_integrity: "INCONSISTENT",
    next_allowed_step: "",
    inconsistency_code: code,
    reason,
    derived_from: {
      registry: "code/src/execution/task_registry.js",
      task_artifacts_directory: "artifacts/tasks"
    },
    derived_at: new Date().toISOString()
  };
}

function buildBlockedState(reason) {
  return {
    status_type: "FORGE_BUILD_STATE",
    current_stage: null,
    current_task: "",
    last_completed_artifact: "",
    closed_tasks: [],
    open_tasks: [],
    pending_gaps: [],
    build_progress_percent: 0,
    execution_integrity: "BLOCKED",
    next_allowed_step: "",
    reason,
    derived_from: {
      registry: "code/src/execution/task_registry.js",
      task_artifacts_directory: "artifacts/tasks"
    },
    derived_at: new Date().toISOString()
  };
}

function deriveState() {
  try {
    const taskNames = extractOrderedTaskNamesFromRegistry();
    const allFiles = listTaskArtifactFiles();
    const closureFiles = allFiles.filter((file) => file.endsWith(".execution.closure.md"));
    const closureMap = buildClosureMap(closureFiles);

    return buildConsistentState(taskNames, closureMap, allFiles);
  } catch (error) {
    return buildBlockedState(error && error.message ? error.message : String(error));
  }
}

module.exports = {
  deriveState
};