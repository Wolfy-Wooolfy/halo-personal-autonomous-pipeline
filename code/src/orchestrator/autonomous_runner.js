const fs = require("fs");
const path = require("path");
const { resolveEntry } = require("./entry_resolver");
const { getNextModule, getModuleByTask } = require("./pipeline_definition");
const statusWriter = require("./status_writer");
const runner = require("./runner");

const ORCH_STATE = path.join(process.cwd(), "artifacts", "orchestration", "orchestration_state.json");

function ensureOrchestrationDir() {
  fs.mkdirSync(path.dirname(ORCH_STATE), { recursive: true });
}

function writeOrchestrationState(payload) {
  ensureOrchestrationDir();
  fs.writeFileSync(ORCH_STATE, JSON.stringify(payload, null, 2), "utf8");
}

const STATUS_PATH = path.resolve(__dirname, "../../..", "progress", "status.json");

function loadStatus() {
  const raw = fs.readFileSync(STATUS_PATH, { encoding: "utf8" });
  return JSON.parse(raw);
}

async function runAutonomous() {
  const entry = resolveEntry();

  writeOrchestrationState({
  started_at: new Date().toISOString(),
  entry_type: entry.entry_type,
  next_task: entry.next_task,
  status: "RUNNING"
  });

  if (entry.blocked) {
    writeOrchestrationState({
      started_at: new Date().toISOString(),
      entry_type: entry.entry_type,
      next_task: entry.next_task,
      status: "BLOCKED",
      reason: entry.reason
    });

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

    const beforeRunStatus = loadStatus();

    await statusWriter.writeStatus({
      ...beforeRunStatus,
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
    
      writeOrchestrationState({
        finished_at: new Date().toISOString(),
        last_task: currentTask,
        status: "COMPLETE"
      });

      console.log("AUTONOMOUS COMPLETE: Pipeline finished.");
      const finalStatus = loadStatus();

      await statusWriter.writeStatus({
        ...finalStatus,
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