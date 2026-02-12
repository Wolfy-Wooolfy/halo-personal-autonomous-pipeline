const registry = Object.freeze({
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

    status.stage_progress_percent = updatedProgress;

    console.log(
      `[HALO] TASK-031 progressed stage to ${updatedProgress}%`
    );

    return true;
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