#!/usr/bin/env bash
# Run once per clone (npm install runs it via "prepare"): activates versioned git hooks.
# Commit author is each contributor's own git config; this script does not change it.
set -euo pipefail
cd "$(dirname "$0")/.."
git config core.hooksPath .githooks
chmod +x .githooks/* scripts/*.sh
echo "hooks: .githooks"
