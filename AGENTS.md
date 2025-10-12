# Repository Guidelines

## Project Structure & Module Organization
- Root workspace (`package.json`) orchestrates both sub-packages under `packages/`.
- `packages/remote-mcp-server-authless/` hosts the Canvas MCP worker (OAuth, SSE, tool logic). Source lives in `src/` and deploy config in `wrangler.jsonc`.
- `packages/cloudflare-canvas-api/` exposes the REST proxy used by the MCP server. TypeScript sources are in `src/`, compiled assets in `dist/`.
- Shared docs (`README.md`, `TESTING.md`, `CHANGELOG.md`) sit at the repository root alongside support files such as `db.json` test fixtures.

## Build, Test, and Development Commands
- `npm run install:all` – bootstrap all workspace dependencies.
- `npm run dev:mcp` / `npm run dev:api` – start the MCP worker or REST proxy in Cloudflare dev mode.
- `npm run build` – compile TypeScript in both packages.
- `npm test` – run unit/integration suites (Vitest) for the MCP worker.
- `npm run lint` – run Biome checks across `packages/remote-mcp-server-authless/src`.
- `npm run deploy:mcp` / `npm run deploy:api` – push to Cloudflare Workers via Wrangler.

## Coding Style & Naming Conventions
- TypeScript-first codebase; prefer explicit types and `async/await` over callbacks.
- Indentation: 2 spaces, wrapped at 100 characters. Keep imports sorted (Biome enforces this).
- File names use kebab-case (`health-risk-analyzer.ts`), classes in PascalCase, functions and variables in camelCase.
- Run `npm run lint` or `npm run format` (Biome) before opening a PR—CI expects clean output.

## Testing Guidelines
- Primary framework: Vitest with in-memory mocks and `MockWebServer` fixtures (see `packages/.../test` when present).
- Add new suites next to implementation under `__tests__/` or `*.test.ts` naming.
- For coverage snapshots, run `vitest run --coverage` inside each package; keep ≥80 % statements on critical modules (OAuth handlers, Canvas API proxies).
- Document manual flows (SSE, Auth0) in `docs/` or update `TESTING.md` when behaviour changes.

## Commit & Pull Request Guidelines
- Commit messages follow the existing history: present-tense, imperative (“Add Auth0 metadata proxy”). Keep subject ≤72 chars; detail breaking context in the body if required.
- One logical change per commit; run build/test hooks locally before pushing.
- Pull requests should include: summary of changes, linked issue/task, testing evidence (`npm test`, curl screenshots for SSE), and deployment impact. Add screenshots or JSON snippets when adjusting API responses or UI output consumed by MCP clients.

## Security & Configuration Tips
- Never commit real Canvas API tokens—use `.dev.vars` for local secrets.
- When updating OAuth flows, ensure `/.well-known` responses, `WWW-Authenticate` headers, and Wrangler environment variables stay in sync.
- Cloudflare deployments should target staging first; note the Worker version ID in PR descriptions for traceability.
