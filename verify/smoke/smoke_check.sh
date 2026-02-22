#!/usr/bin/env sh
set -e

node verify/smoke/local_command_logger.js "SMOKE_CHECK_START"

node verify/smoke/runner_smoke.js
node verify/smoke/runner_dry_run_smoke.js
node verify/smoke/stage_transitions_smoke.js
node verify/smoke/status_writer_smoke.js

node verify/smoke/local_command_logger.js "SMOKE_CHECK_END"