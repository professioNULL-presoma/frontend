#!/usr/bin/env bash
# Usage: check-authors.sh <rev-list args...>   e.g. origin/main..HEAD
# Fails if any commit has a different author/committer, or a contributor trailer.
set -euo pipefail
. "$(dirname "$0")/identity.sh"
bad=0
while IFS= read -r sha; do
  [ -z "$sha" ] && continue
  ae=$(git show -s --format=%ae "$sha"); ce=$(git show -s --format=%ce "$sha")
  if [ "$ae" != "$ALLOWED_EMAIL" ]; then
    echo "✗ $sha author email '$ae' != $ALLOWED_EMAIL"; bad=1
  fi
  if [ "$ce" != "$ALLOWED_EMAIL" ] && [ "$ce" != "$GITHUB_WEB_COMMITTER" ]; then
    echo "✗ $sha committer email '$ce' != $ALLOWED_EMAIL"; bad=1
  fi
  if git show -s --format=%B "$sha" | grep -qiE '^(co-authored-by|signed-off-by):'; then
    echo "✗ $sha has a Co-authored-by/Signed-off-by trailer"; bad=1
  fi
done < <(git rev-list "$@")
exit $bad
