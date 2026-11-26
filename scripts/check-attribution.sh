#!/usr/bin/env bash
# Usage: check-attribution.sh <rev-list args...>   e.g. origin/main..HEAD
# Fails if a commit credits an AI tool as author, committer, co-author, or "Generated with".
set -euo pipefail
ai='claude|anthropic|copilot|cursor|openai|chatgpt|gpt-|gemini|codex|devin'
bad=0
while IFS= read -r sha; do
  [ -z "$sha" ] && continue
  who=$(git show -s --format='%an %ae %cn %ce' "$sha")
  if echo "$who" | grep -qiE "$ai"; then
    echo "✗ $sha author/committer looks like an AI tool: $who"; bad=1
  fi
  msg=$(git show -s --format=%B "$sha")
  if echo "$msg" | grep -iE '^[[:space:]]*co-authored-by:' | grep -qiE "$ai"; then
    echo "✗ $sha has an AI Co-authored-by trailer"; bad=1
  fi
  if echo "$msg" | grep -qiE '^[[:space:]]*(🤖 )?generated (with|by) '; then
    echo "✗ $sha has a \"Generated with\" line"; bad=1
  fi
done < <(git rev-list "$@")
exit $bad
