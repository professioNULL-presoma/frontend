---
inclusion: always
---

# Commit policy

- The only contributor is `SeokHyun <175220348+sh-mms@users.noreply.github.com>`.
- Never add `Co-authored-by:`, `Signed-off-by:`, "Generated with ..." or any tool/AI attribution to commit messages, PR bodies, or code headers.
- Never change `user.name`, `user.email`, `GIT_AUTHOR_*`, or `GIT_COMMITTER_*`. Never pass `--author`, `--no-verify`, or `-c user.*`.
- Run `scripts/setup.sh` in a fresh clone. Enforcement lives in `.githooks/` (local) and `.github/workflows/ci.yml` (server).
- Only commit or push when the user asks.
