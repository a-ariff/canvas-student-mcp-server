# Smithery Deployment Runbook (Sequential Thinking)

Status: Active on main (v3.0.1). This runbook defines a deterministic sequence to get a remote MCP server published on Smithery using a local TypeScript wrapper.

## Executive Summary

- Problem: Smithery platform build repeatedly failed with "Could not resolve @smithery/sdk" (and chalk) during `@smithery/cli build`.
- Root cause: Platform uses `npm ci` when `package-lock.json` exists, so newly added dependencies were not installed; bundler’s virtual bootstrap requires `@smithery/sdk` available at repo root.
- Fixes applied:
  - Added a local TypeScript wrapper entry at repo root (`src/index.ts`, `module: ./src/index.ts`).
  - Added `@smithery/sdk` and `chalk` under root `dependencies` (not just devDependencies).
  - Removed root `package-lock.json` so platform runs `npm install` and resolves new dependencies.
  - Bumped Smithery config to `runtime: typescript` and synced guides.

## Preflight Checklist (Run in order)

1) Confirm repo root & commit
- Latest commit on main: `git log -1 --oneline`
- Matches Smithery log line: `Commit: <sha>`
- If mismatch: re-trigger build against latest main.

2) Ensure entrypoint present
- Root `package.json` has `"module": "./src/index.ts"`
- Root `src/index.ts` exists and spawns `@modelcontextprotocol/client-oauth2` to the SSE URL

3) Ensure required deps are installable
- Root `package.json` includes:
  - `dependencies`: `@smithery/sdk`, `chalk`
- No root `package-lock.json` (so platform uses `npm install`)

4) Smithery config conforms
- `smithery.yaml` contains:
  - `name`, `version`, `runtime: typescript`
  - No `remote:` block (GitHub flow expects a buildable package)
  - Remote endpoints documented under `deployment` (informational)

5) Re-run Smithery build
- From Smithery dashboard, deploy main latest commit
- Watch for build lines:
  - `SMITHERY vX.Y.Z Building MCP server...`
  - No `Could not resolve "@smithery/sdk"` errors

## If Build Still Fails

1) Force install deps in build
- Add root script:
  - `"postinstall": "node scripts/smithery-postinstall.js"`
- `scripts/smithery-postinstall.js` content:
  - Try `require.resolve('@smithery/sdk')`; if missing, run `npm i @smithery/sdk chalk --no-save`

2) Custom Dockerfile.smithery (override)
- At repo root, add `Dockerfile.smithery` that explicitly runs:
  - `RUN npm install && npm install @smithery/sdk chalk --no-save`
  - Then `RUN npx -y @smithery/cli build -o .smithery/index.cjs`

3) Lockfile reconciliation
- If lockfile is required, generate a fresh `package-lock.json` by running `npm install` locally, commit, push, then redeploy.

## Verification Steps

- Smithery CI on main: `Smithery Submission` shows success
- Platform builder no longer reports unresolved `@smithery/sdk`/`chalk`
- Local quick test (Claude config): wrapper starts and connects to SSE

## Notes on Remote vs Local for Smithery

- GitHub publishing path requires a local buildable entry.
- Remote-only `remote:` config is not accepted; use a wrapper.
- The wrapper does not change runtime behavior—still connects to your hosted SSE server via OAuth.

## Tools To Strengthen Problem Solving (Optional)

If you want to augment your local agent, install these MCP servers (run locally):

- Sequential Thinking (Smithery):
  - `npx -y @smithery/cli@latest install @smithery-ai/server-sequential-thinking --client codex --profile sad-bobcat-uolbER --key 88810843-1f91-47b8-86f9-ae74c29f3730`
- Smithery Toolbox:
  - `npx -y @smithery/cli@latest install @smithery/toolbox --client codex --key 88810843-1f91-47b8-86f9-ae74c29f3730`

(These are optional developer aids; they don’t change server behavior.)

## Post‑Merge Checklist (Automation Owner)

- Tag release (done for v3.0.1)
- Verify build on Smithery main commit
- Share install command for classmates:
  - `npx -y @smithery/cli install @a-ariff/canvas-ai-assistant`
- Keep `smithery.yaml` version aligned with release tags

## Appendix – Quick Commands

- Show Smithery jobs on main:
  - `gh run list --branch main -L 10`
- View PR checks:
  - `gh pr checks <number>`
- Merge PR when checks pass:
  - `gh pr merge <number> --squash --delete-branch`

---
Owner: Ariff
Last Updated: 2025‑10‑31
Version: 3.0.1
