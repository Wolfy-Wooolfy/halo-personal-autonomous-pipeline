#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const STATUS_PATH = path.resolve(ROOT, "progress", "status.json");

function readStatusRaw() {
  return fs.readFileSync(STATUS_PATH, { encoding: "utf8" });
}

function isAutonomyEnabled() {
  const v = process.env.FORGE_AUTONOMY !== undefined ? process.env.FORGE_AUTONOMY : process.env.HALO_AUTONOMY;
  return String(v) === "1";
}

function parseMaxStepsArg(argv) {
  const a = argv.find(x => x.startsWith("--max-steps="));
  if (!a) return null;
  const n = Number(a.split("=")[1]);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

function runScript(scriptRelPath, argv, envPatch) {
  const scriptAbs = path.resolve(ROOT, scriptRelPath);
  const env = { ...process.env, ...(envPatch || {}) };

  const res = spawnSync(process.execPath, [scriptAbs, ...argv], {
    stdio: "inherit",
    env
  });

  const code = typeof res.status === "number" ? res.status : 1;
  process.exit(code);
}

function main() {
  const argv = process.argv.slice(2);

  const cmd = argv[0] ? String(argv[0]).toLowerCase() : "";

  if (cmd === "status") {
    const raw = readStatusRaw();
    process.stdout.write(raw);
    process.exit(0);
  }

  const maxSteps = parseMaxStepsArg(argv);
  const envPatch = {};

  if (maxSteps !== null) {
    envPatch.FORGE_MAX_STEPS = String(maxSteps);
  }

  if (cmd === "run") {
    runScript("bin/halo-run.js", argv.slice(1), envPatch);
  }

  if (cmd === "step") {
    runScript("bin/halo-autonomy-step.js", argv.slice(1), envPatch);
  }

  if (cmd === "") {
    if (isAutonomyEnabled()) {
      runScript("bin/halo-autonomy-step.js", argv, envPatch);
    }
    runScript("bin/halo-run.js", argv, envPatch);
  }

  runScript(isAutonomyEnabled() ? "bin/halo-autonomy-step.js" : "bin/halo-run.js", argv, envPatch);
}

main();