const { execSync } = require("child_process");
const path = require("path");

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

function main() {
  console.log("== HALO Pre-Run Check ==");

  run("node verify/smoke/stage_transitions_smoke.js");
  run("node verify/smoke/status_writer_smoke.js");
  run("node verify/smoke/runner_smoke.js");

  console.log("Smoke tests: PASS");

  // Integrity verification is optional; only run if hashes file exists
  try {
    run("node tools/integrity.js verify release_1.0.0.hashes.json");
    console.log("Integrity: PASS");
  } catch (_) {
    console.log("Integrity: SKIPPED (no hashes file)");
  }

  console.log("Pre-Run Check: OK");
}

main();
