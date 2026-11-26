---
inclusion: always
---

# Commit policy

- Commits are authored by the human contributor with their own git identity.
- Never credit an AI tool: no `Co-authored-by:` trailer naming an AI, no "Generated with ..." line, no AI attribution in PR bodies or code headers. Human co-authors are fine.
- Never change `user.name`, `user.email`, `GIT_AUTHOR_*`, or `GIT_COMMITTER_*`. Never pass `--author`, `--no-verify`, or `-c user.*`.
- Enforcement lives in `.githooks/` (local, enabled by `scripts/setup.sh` on `npm install`) and `.github/workflows/ci.yml` (server).
- Only commit or push when the user asks.
