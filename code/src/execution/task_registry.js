const fs = require("fs");
const path = require("path");

const TASKS_PATH = path.resolve(__dirname, "../../..", "artifacts", "tasks");

const registry = Object.freeze({

  "SMOKE: prepare transition B -> C": (context) => {
    return {
      stage_progress_percent: 0
    };
  },

  "TASK-031: Self-Validation": (context) => {
    if (!context || !context.status) {
      throw new Error("Invalid execution context");
    }

    const status = context.status;

    if (typeof status.stage_progress_percent !== "number") {
      throw new Error("Invalid stage_progress_percent");
    }

    const increment = 10;
    const updatedProgress = Math.min(
      100,
      status.stage_progress_percent + increment
    );

    console.log(
      `[HALO] TASK-031 progressed stage to ${updatedProgress}%`
    );

    if (updatedProgress === 100) {
      const closureFile = path.join(
        TASKS_PATH,
        "TASK-031.execution.closure.md"
      );

      const content = `# TASK-031 — Execution Closure

Status: COMPLETE

Stage: ${status.current_stage}

Final Progress: 100%

This artifact confirms deterministic completion of TASK-031.
`;

      fs.writeFileSync(closureFile, content, { encoding: "utf8" });

      console.log("[HALO] TASK-031 execution closure artifact created.");

      return {
        stage_progress_percent: 100,
        artifact: "artifacts/tasks/TASK-031.execution.closure.md",
        closure_artifact: true
      };
    }

    return {
      stage_progress_percent: updatedProgress
    };
  }

});

function getHandler(taskName) {
  if (!taskName) {
    throw new Error("Task name required");
  }

  if (!registry[taskName]) {
    throw new Error(`No handler registered for task: ${taskName}`);
  }

  return registry[taskName];
}

module.exports = {
  getHandler
};