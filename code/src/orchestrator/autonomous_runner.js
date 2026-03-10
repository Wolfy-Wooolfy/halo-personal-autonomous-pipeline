const { resolveEntry } = require("./entry_resolver");
const { getNextModule, getModuleByTask } = require("./pipeline_definition");
const statusWriter = require("./status_writer");
const runner = require("./runner");

async function runAutonomous() {
  const entry = resolveEntry();

  if (entry.blocked) {
    console.log("FORGE AUTONOMOUS STOPPED: BLOCKED");
    console.log(entry.reason);
    return;
  }

  if (entry.entry_type === "COMPLETE") {
    console.log("FORGE AUTONOMOUS: Pipeline already complete.");
    return;
  }

  let currentTask = entry.next_task;

  while (currentTask) {
    console.log("AUTONOMOUS RUN →", currentTask);

    await statusWriter.writeStatus({
      current_task: currentTask,
      next_step: "AUTONOMOUS EXECUTION"
    });

    await runner.run();

    const module = getModuleByTask(currentTask);

    if (!module) {
      console.log("AUTONOMOUS ERROR: module not found");
      return;
    }

    if (module.terminal_flag) {
      console.log("AUTONOMOUS COMPLETE: Pipeline finished.");
      await statusWriter.writeStatus({
        current_task: "",
        next_step: "READY — Autonomous pipeline complete"
      });
      return;
    }

    const nextModule = getNextModule(module.module_id);

    if (!nextModule) {
      console.log("AUTONOMOUS ERROR: next module missing");
      return;
    }

    currentTask = nextModule.task_name;
  }
}

module.exports = {
  runAutonomous
};