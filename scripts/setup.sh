#!/usr/bin/env bash
# Run once per clone: pins identity and activates versioned hooks.
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/identity.sh
git config core.hooksPath .githooks
git config user.name "$ALLOWED_NAME"
git config user.email "$ALLOWED_EMAIL"
git config commit.gpgsign false
git config trailer.ifexists doNothing
chmod +x .githooks/* scripts/*.sh
echo "Identity: $ALLOWED_NAME <$ALLOWED_EMAIL>; hooks: .githooks"
