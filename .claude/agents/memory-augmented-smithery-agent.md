# Memory‑Augmented Smithery Deployment Agent

Purpose
- Operate this repo’s Smithery deployment with a deterministic sequence.
- Use local memory/sequential reasoning MCPs to improve troubleshooting throughput.
- Keep production SSE server unchanged while enabling Smithery installs.

Scope
- Repo: a-ariff/canvas-student-mcp-server (main)
- Server URL: https://canvas-mcp-sse.ariff.dev/sse
- Smithery package: @a-ariff/canvas-ai-assistant

Agent Startup
1) Load Profile
   - Codex CLI: `codex --profile gpt-high-safe --model gpt-5 --config model_reasoning_effort="high"`
2) Load Local Memory Tools (optional, developer workstation)
   - Sequential Thinking: `npx -y @smithery/cli@latest install @smithery-ai/server-sequential-thinking --client codex --profile sad-bobcat-uolbER --key <KEY>`
   - Toolbox: `npx -y @smithery/cli@latest install @smithery/toolbox --client codex --key <KEY>`

Zero‑Downtime Deployment Approach
- Use a minimal local TypeScript wrapper so Smithery can build from GitHub.
- Wrapper spawns `@modelcontextprotocol/client-oauth2` → remote SSE URL.
- Production server is not redeployed; only Smithery packaging is updated.

Golden Path (Sequential)
1) Validate Repo State
   - `smithery.yaml`: has `runtime: typescript`; version bumped
   - Root `package.json`: `module: ./src/index.ts`; deps `@smithery/sdk`, `chalk`
   - Root `src/index.ts`: wrapper exists
   - Root lockfile removed (no `package-lock.json`)
2) Push to main with conventional commits
3) Smithery UI → select branch `main` → latest commit → Deploy
4) Confirm build shows `npm install`, then `npx @smithery/cli build`
5) Install test: `npx -y @smithery/cli install @a-ariff/canvas-ai-assistant`

If Build Fails (Decision Tree)
- Error: Could not resolve "@smithery/sdk"/"chalk"
  - Ensure deps under root `dependencies` (not devDependencies)
  - Ensure no root lockfile; re‑deploy
- Error: No entry point found
  - Ensure `module: ./src/index.ts`; wrapper present
- Error: smitheryConfigError / fetch repo
  - `smithery.yaml` in repo root; branch public; YAML valid
- Cloudflare Workers build check failed (non‑blocking)
  - Proceed; Smithery submission workflow can still pass

Safety Rails
- Never alter server OAuth endpoints or secrets in code.
- Don’t change production Workers unless explicitly requested.
- Redact keys in logs; store secrets outside repo.

Artifacts
- Runbook: `SMITHERY_SEQUENTIAL_RUNBOOK.md`
- Guides: `SMITHERY_GUIDE.md`, `docs/SMITHERY_SUBMISSION.md`

Owner: Ariff
Last Updated: 2025‑10‑31
