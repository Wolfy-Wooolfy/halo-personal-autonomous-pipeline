const { getHandler } = require("./task_registry");

function executeTask(taskName, context) {
  if (!taskName) {
    throw new Error("Cannot execute undefined task");
  }

  const handler = getHandler(taskName);

  if (typeof handler !== "function") {
    throw new Error(`Invalid handler for task: ${taskName}`);
  }

  return handler(context);
}

module.exports = {
  executeTask
};