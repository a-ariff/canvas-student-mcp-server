# Repository Guidelines

## 📋 Executive Summary

### Security Status
- **Public endpoint disabled** - No longer accepts Canvas API keys via URL parameters
- **Secret logging suppressed** - All Canvas API keys redacted as `[REDACTED]` in logs
- **Shared Canvas key removed** - Production runs in **single-user safe mode**
- **Canvas tools intentionally disabled** - Return "credentials not configured" error until per-user storage implemented
- **Report:** See `SECURITY_FIX_REPORT_2025-10-15.md` for complete details

### Current State
- **Production Status:** ✅ Deployed and secure (Version `b5a28913-fc1f-4f9c-8c4e-b83cb385944b`)
- **Security Level:** 🟢 Safe for single-user deployment
- **Multi-User Canvas:** ⚠️ Intentionally disabled (requires Option 1 implementation)
- **OAuth Authentication:** ✅ Fully functional with PKCE

### Revised Plan

**Near Term (Now):**
- Document local self-hosting as the privacy-first option (stdio MCP server)
- Keep remote worker in single-user safe mode
- Rotate any legacy secrets if needed
- Log tool usage per authenticated user
- Add KV cleanup/rotation path

**Next Milestone (Optional - 6 hours):**
- Implement Option 1 from `CRITICAL_ARCHITECTURE_ISSUE.md`
- Add `POST /api/v1/canvas/config` endpoint
- Store Canvas credentials in KV keyed by OAuth `userId`
- Update all 12 Canvas tools to read per-user credentials
- Tools fail fast when no per-user record found

**Follow-Up (Future):**
- Extend OpenAPI/Actions schema with config endpoint
- Enable hosted clients to prime credentials automatically
- Keep MCP approvals enabled until per-user flows proven
- Rate-limit any future admin/API-key features

### Using It Across Multiple Colleges

**Current Approach (Manual Tokens):**
- Each student provides their own Canvas API token (from their college's Canvas)
- Once per-user storage implemented, same worker supports multiple institutions
- Credentials stored per-user, not globally (no per-institution configuration needed)

**Future Approach (Canvas OAuth - Complex):**
- Register your MCP app with each Canvas tenant (college by college)
- Implement Canvas OAuth flow for each institution
- Swap manual token step for automated OAuth per-college
- Estimated effort: ~40 hours for full Canvas OAuth integration

**Recommendation:** Start with manual tokens (Option 1), evaluate Canvas OAuth later based on demand.

---

## 🎯 Current Project Status (October 15, 2025)

**Owner:** Ariff (i@ariff.dev)  
**Branch:** `feature/chatgpt-oauth-and-docs`  
**Production:** Live at `https://canvas-mcp-sse.ariff.dev`  
**Latest Deploy:** Version `b5a28913-fc1f-4f9c-8c4e-b83cb385944b`

### Recent Security Fixes (JUST DEPLOYED)
- ✅ **Fixed:** Public endpoint disabled (was exposing Canvas API keys)
- ✅ **Fixed:** API key logging removed from Cloudflare logs
- ✅ **Fixed:** Shared Canvas API key removed (prevents multi-user data leakage)
- ✅ **Status:** Safe for single-user deployment

### Known Issues (TO BE FIXED)
- ⚠️ **Multi-user architecture not implemented** - Canvas tools return error message
- ⚠️ **See:** `CRITICAL_ARCHITECTURE_ISSUE.md` for full details
- 📋 **Plan:** Implement per-user Canvas API keys (Option 1 from CRITICAL_ARCHITECTURE_ISSUE.md)
- ⏰ **Effort:** ~6 hours implementation + testing

### Current Deployment Plan
**User's Decision:** Keep as single-user for now OR implement multi-user support
- **Option A (Quick):** Document as single-user only, use for personal projects
- **Option B (Full Fix):** Implement per-user Canvas key storage (see CRITICAL_ARCHITECTURE_ISSUE.md)

### What Works Now
- ✅ OAuth 2.1 authentication with PKCE
- ✅ SSE transport for MCP protocol
- ✅ 12 Canvas LMS tools (courses, assignments, grades, etc.)
- ✅ ChatGPT, Claude Desktop, Perplexity integrations documented
- ✅ Cloudflare Workers deployment (free tier, supports 100+ users)

### What's Broken
- ❌ Multi-user Canvas API access (all users see same Canvas data)
- ❌ Public endpoint (intentionally disabled for security)

---

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

- Commit messages follow the existing history: present-tense, imperative ("Add Auth0 metadata proxy"). Keep subject ≤72 chars; detail breaking context in the body if required.
- **Create commits manually that look like the developer wrote them, with no AI markers** – avoid emojis, checkboxes, "AI-generated" indicators, or automated formatting patterns.
- **IMPORTANT**: Remove AI collaboration markers from commit messages:
  - ❌ DO NOT use: "🤖 Generated with Claude Code", "Co-Authored-By: Claude", emojis (✨🔧🚀), or "feat:", "fix:" prefixes
  - ✅ DO use: Natural, human-like commit messages in imperative mood
  - Examples:
    - Good: "Add rate limiting to OAuth endpoints"
    - Bad: "feat: ✨ Add rate limiting to OAuth endpoints 🤖"
- One logical change per commit; run build/test hooks locally before pushing.
- Pull requests should include: summary of changes, linked issue/task, testing evidence (`npm test`, curl screenshots for SSE), and deployment impact. Add screenshots or JSON snippets when adjusting API responses or UI output consumed by MCP clients.

## AI Agent Instructions for Terminal/CLI Tools

When using AI agents (Claude Code, Cursor, GitHub Copilot, etc.) with this repository:

### Commit Creation

1. **Always create natural commits**: Remove any AI-generated markers, emojis, or automated prefixes
2. **Follow existing commit style**: Review recent commits with `git log --oneline -10` before committing
3. **Use imperative mood**: "Add feature" not "Added feature" or "Adds feature"
4. **Be specific but concise**: "Fix OAuth token expiration in auth middleware" not "Fix bug"
5. **Sign commits if configured**: Respect user's GPG/commit signing settings

### Code Changes

1. **Test before committing**: Run `npm test` and `npm run lint` before every commit
2. **Review changes**: Always show `git diff` before committing
3. **Incremental commits**: Commit logical units of work, not entire features at once
4. **Document changes**: Update relevant docs in the same commit as code changes

### Security Practices

1. **Never commit secrets**: Check for API keys, tokens, or passwords before committing
2. **Use .env templates**: Create .env.example files instead of committing .env
3. **Review dependencies**: Run `npm audit` before adding new packages
4. **Validate inputs**: Ensure all user inputs are sanitized and validated

### Deployment

1. **Test locally first**: Use `wrangler deploy --dry-run` before actual deployment
2. **Check environment**: Verify you're deploying to correct environment (staging vs production)
3. **Monitor after deploy**: Check logs with `wrangler tail` after deployment
4. **Rollback plan**: Keep previous deployment version for quick rollback

### Example Workflow for AI Agents

```bash
# 1. Make changes to code
# 2. Test changes
npm test && npm run lint

# 3. Review changes
git status
git diff

# 4. Stage changes
git add src/oauth-handlers.ts

# 5. Create natural commit (NO AI MARKERS)
git commit -m "Add rate limiting to OAuth authorization endpoint

Implement token bucket algorithm to prevent brute force attacks.
Limits requests to 10 per minute per IP address.

Resolves security concern from issue #42"

# 6. Push to feature branch
git push origin feature/oauth-rate-limiting
```

### Configuration for Claude Code

If using Claude Code in VS Code terminal, configure with these settings:

```json
{
  "claude.code.commitStyle": "natural",
  "claude.code.removeAIMarkers": true,
  "claude.code.runTestsBeforeCommit": true,
  "claude.code.respectGitHooks": true
}
```

## Security & Configuration Tips

- Never commit real Canvas API tokens—use `.dev.vars` for local secrets.
- When updating OAuth flows, ensure `/.well-known` responses, `WWW-Authenticate` headers, and Wrangler environment variables stay in sync.
- Cloudflare deployments should target staging first; note the Worker version ID in PR descriptions for traceability.

---

## Security Status (2025-10-15)
- ✅ `/public` endpoint disabled - Returns `endpoint_disabled` (403), prevents API keys via URL
- ✅ Canvas API keys redacted in logs - No sensitive values in Cloudflare analytics
- ✅ Shared `CANVAS_API_KEY` removed - Production worker (`b5a28913-fc1f-4f9c-8c4e-b83cb385944b`) in **single-user safe mode**
- ✅ All Canvas tools show security error:
  ```
  Error: Canvas API credentials not configured.
  Multi-user Canvas support coming soon.
  ```
- ✅ Current deployment safe for personal use
- ⚠️ Multi-user Canvas access intentionally disabled until per-user storage implemented

**See:** `SECURITY_FIX_REPORT_2025-10-15.md` for complete details of all fixes

## Current Architecture & Implementation Plan
- **Local MCP server**: `packages/canvas-student-mcp-server/dist/index.js` stays the stdio build for Claude/Codex. Secrets live in the user's `.dev.vars`; this is the recommended privacy-first option.
- **Remote Cloudflare worker**: next milestone is Option 1 (per-user Canvas keys). Add `POST /api/v1/canvas/config` that writes KV entries scoped by OAuth `userId`, update all Canvas tools to read from KV, and keep the worker failing fast if no entry exists.
- **Identity**: Auth0 (or similar) continues to handle OAuth; Canvas credentials must be supplied per user (manual API token now, Canvas OAuth later). Never reinstate a global Canvas secret in Wrangler.
- **OpenAPI / GPT schema**: extend the spec to expose the config endpoint so hosted clients can prime credentials automatically; continue returning `missing_config` until the POST succeeds.
- **Security posture**: rotate any legacy keys, log tool use per user, provide a KV purge/rotation path, and keep MCP approvals enabled until per-user flows are proven. Rate-limit any future admin/API-key features per the security checklist.

**Last Updated**: 2025-10-15  
**Status**: Single-user secure; multi-user Canvas support pending per-user credential storage

### Project Goals

This project provides a **public Canvas LMS MCP server** deployed on Cloudflare Workers that:

- Allows multiple users to connect via OAuth 2.1 authentication
- Provides MCP tools to access Canvas courses, assignments, grades, etc.
- Scales to support 100+ users on free tier
- Maintains security and privacy for all users

### Critical Architecture Issues Discovered

#### Issue 1: Canvas API Key Architecture (CRITICAL - FIXED October 15, 2025)

---

## Security Status (2025-10-15)
- `/public` endpoint now returns `endpoint_disabled` (403) so API keys can’t be passed via URL.
- Canvas API keys are redacted in logs; no sensitive values persist in Cloudflare analytics.
- Shared `CANVAS_API_KEY` env usage removed; production worker (`b5a28913-fc1f-4f9c-8c4e-b83cb385944b`) runs in **single-user safe mode**. All Canvas tools reply:
  ```
  Error: Canvas API credentials not configured.
  Multi-user Canvas support coming soon.
  ```
- Current deployment is safe for personal use, but multi-user Canvas access is intentionally disabled until per-user storage lands.

## Current Architecture & Implementation Plan
- **Local MCP server**: `packages/canvas-student-mcp-server/dist/index.js` stays the stdio build for Claude/Codex. Secrets live in the user’s `.dev.vars`; this is the recommended privacy-first option.
- **Remote Cloudflare worker**: next milestone is Option 1 (per-user Canvas keys). Add `POST /api/v1/canvas/config` that writes KV entries scoped by OAuth `userId`, update all Canvas tools to read from KV, and keep the worker failing fast if no entry exists.
- **Identity**: Auth0 (or similar) continues to handle OAuth; Canvas credentials must be supplied per user (manual API token now, Canvas OAuth later). Never reinstate a global Canvas secret in Wrangler.
- **OpenAPI / GPT schema**: extend the spec to expose the config endpoint so hosted clients can prime credentials automatically; continue returning `missing_config` until the POST succeeds.
- **Security posture**: rotate any legacy keys, log tool use per user, provide a KV purge/rotation path, and keep MCP approvals enabled until per-user flows are proven. Rate-limit any future admin/API-key features per the security checklist.

**Last Updated**: 2025-10-15  
**Status**: Single-user secure; multi-user Canvas support pending per-user credential storage

### Project Goals

This project provides a **public Canvas LMS MCP server** deployed on Cloudflare Workers that:

- Allows multiple users to connect via OAuth 2.1 authentication
- Provides MCP tools to access Canvas courses, assignments, grades, etc.
- Scales to support 100+ users on free tier
- Maintains security and privacy for all users

### Critical Architecture Issues Discovered

#### Issue 1: Canvas API Key Architecture (CRITICAL - Must Fix Before Public Release)

**Problem**: Current code uses a single Canvas API key from environment variable for ALL users, meaning all users would see the server owner's Canvas data instead of their own.

**Location**: `packages/remote-mcp-server-authless/src/index.ts:97`

```typescript
canvasApiKey: this.env?.CANVAS_API_KEY; // ← Wrong: Uses ONE key for all users
```

**Impact**:

- User Alice authenticates → sees server owner's courses (not hers) ❌
- Security/privacy violation - users access wrong data ❌
- Cannot support multiple users ❌

**Status**: **NOT FIXED** - Requires implementation before public deployment

**Solution Chosen**: **Option 1 - Per-User Canvas API Keys**

Users provide their Canvas API key during OAuth authentication, which is stored with their OAuth token in KV.

**Implementation Required**:

1. Update OAuth authorization handler to collect Canvas API key from users
2. Store Canvas API key with each user's OAuth token in KV
3. Update authentication to include Canvas credentials in AuthContext
4. Update all MCP tool handlers to use per-user Canvas API key
5. Update AuthContext type definition
6. Test with multiple Canvas accounts

**Effort**: ~6 hours
**Priority**: CRITICAL - Block public release
**Documentation**: See `CRITICAL_ARCHITECTURE_ISSUE.md` for detailed implementation steps

#### Issue 2: API Key Authentication Security (HIGH - Must Fix Before Public Release)

**Problem**: Documentation exposes method for anyone with Wrangler access to generate API keys directly to KV, bypassing authentication.

**Location**: `packages/remote-mcp-server-authless/AUTHENTICATION.md:147-157`

**Impact**:

- If repo goes public, shows how to bypass authentication ❌
- Allows unauthorized Canvas data access ❌
- No audit trail for API key generation ❌

**Status**: **NOT FIXED** - Requires implementation before public deployment

**Solution Chosen**: **Option A - OAuth-Only Authentication**

Disable API key authentication entirely for public deployment. Only use OAuth 2.1 with PKCE.

**Implementation Required**:

1. Update `AUTHENTICATION.md` to remove API key generation documentation
2. Add `API_KEY_AUTH_ENABLED: "false"` flag to `wrangler.jsonc`
3. Update `src/index.ts` to check flag and reject API key attempts with 403
4. Update `README.md` with security notice (OAuth-only)
5. Update root `README.md` with security model section

**Effort**: ~1.5 hours
**Priority**: HIGH - Block public release
**Documentation**: See `SECURITY_RECOMMENDATIONS.md` and `SECURITY_IMPLEMENTATION_CHECKLIST.md`

### Implementation Roadmap

#### ✅ Phase 1: Fix Critical Security Issues (COMPLETED - October 15, 2025)

**Completed Tasks:**

1. **✅ Fix Public Endpoint Security** - Issue 2 (COMPLETED)
   - [x] Disabled `/public` endpoint completely
   - [x] Returns 403 Forbidden with error message
   - [x] Removed API key acceptance via URL parameters
   - [x] Updated security documentation
   - **Deployed:** Version `d564bc1f-79d7-4779-bb9b-ff7a949dd09d`
   - **Commit:** `02dcf3e`

2. **✅ Fix API Key Logging** - Issue 2 (COMPLETED)
   - [x] Removed all Canvas API key logging
   - [x] Replaced with `[REDACTED]` placeholders
   - [x] Verified Cloudflare logs are clean
   - **Deployed:** Version `d564bc1f-79d7-4779-bb9b-ff7a949dd09d`
   - **Commit:** `02dcf3e`

3. **✅ Remove Shared Canvas API Key** - Issue 1 (COMPLETED)
   - [x] Removed environment variable usage
   - [x] Canvas config returns empty strings
   - [x] All 12 Canvas tools return security error
   - [x] Added clear user-facing error message
   - **Deployed:** Version `b5a28913-fc1f-4f9c-8c4e-b83cb385944b`
   - **Commit:** `2d76c59`

**Security Status:** 🟢 **SECURE** - Safe for single-user deployment

---

#### ⏳ Phase 2: Multi-User Canvas Support (OPTIONAL - Not Started)

**Decision Required:** Single-user vs Multi-user deployment

**Option A: Keep Single-User (0 hours)**
- Current implementation works for personal use
- OAuth authentication functional
- Canvas tools disabled with clear error message
- No additional work needed
- ✅ Recommended for personal projects

**Option B: Implement Multi-User Canvas Keys (6 hours)**
- Store per-user Canvas API keys in OAuth tokens
- Update all 12 Canvas tools to use user's key
- Test with 2+ Canvas accounts
- See: `CRITICAL_ARCHITECTURE_ISSUE.md` for steps
- ⏳ Required for public multi-user deployment

---

#### Phase 3: Testing & Validation (If Option B chosen)

**Multi-User Testing** (2 hours)
   - [ ] Test with 2+ different Canvas accounts
   - [ ] Verify user isolation (users see only their data)
   - [ ] Test OAuth flow end-to-end
   - [ ] Verify all Canvas tools work with per-user keys
   - [ ] Verify all 14 security tests still pass

**Load Testing** (1 hour)
   - [ ] Simulate 10+ concurrent users
   - [ ] Verify KV operations within limits
   - [ ] Check response times
   - [ ] Monitor Cloudflare metrics

---

#### Phase 4: Documentation & Final Deployment (If Option B chosen)

5. **Documentation Updates** (1 hour)
   - [ ] Update all user-facing documentation
   - [ ] Add user setup guides
   - [ ] Create troubleshooting guide
   - [ ] Update CHANGELOG.md

6. **Production Deployment** (1 hour)
   - [ ] Deploy to staging
   - [ ] Test staging thoroughly
   - [ ] Deploy to production
   - [ ] Monitor for 24 hours
   - [ ] Update GitHub repository visibility (if going public)

**Total Estimated Time**: ~11.5 hours

---

## 📊 Implementation Summary (October 15, 2025)

### Work Completed Today

✅ **3 Critical Security Vulnerabilities Fixed:**

1. **Public Endpoint Security** (CRITICAL)
   - Disabled `/public` endpoint that accepted Canvas API keys via URL
   - Now returns 403 Forbidden with clear error message
   - Prevents API key exposure in browser history and logs

2. **Canvas API Key Logging** (HIGH)
   - Removed all Canvas API key logging from code
   - Replaced with `[REDACTED]` placeholders
   - Cloudflare logs no longer contain sensitive credentials

3. **Shared Canvas API Key** (CRITICAL)
   - Removed shared environment variable that would expose one user's data to all
   - Canvas config now returns empty strings
   - All Canvas tools return clear error message about multi-user limitation

### Deployments Completed

- **Version 1:** `d564bc1f-79d7-4779-bb9b-ff7a949dd09d` (Public endpoint + logging fix)
- **Version 2:** `b5a28913-fc1f-4f9c-8c4e-b83cb385944b` (Shared API key fix) ← **CURRENT**

### Git Commits Pushed

- `02dcf3e` - Disable public endpoint and remove API key logging
- `2d76c59` - Remove shared Canvas API key to prevent multi-user data leakage

### Documentation Created

- `SECURITY_FIX_REPORT_2025-10-15.md` - Comprehensive security fix report
- Updated `AGENTS.md` - Current project status and roadmap
- Updated `PERSONAL_AGENT.md` - Current status for future AI assistants

### Current Status

**Security Level:** 🟢 **SECURE** - Safe for single-user deployment  
**Multi-User Status:** ⚠️ Canvas tools disabled (show error message)  
**Production Status:** ✅ Deployed and stable  
**Next Decision:** Choose Option A (single-user) or Option B (multi-user support)

---

### Architecture Decisions

#### Authentication Strategy: OAuth-Only

**Decision**: Use OAuth 2.1 with PKCE for MCP server authentication. Disable API key authentication for public deployment.

**Rationale**:

- Industry standard (used by Google, GitHub, etc.)
- Each user has individual credentials
- Automatic token expiration and refresh
- Better security than shared API keys
- Simpler for users (one browser click vs managing API keys)

**Trade-offs**:

- Requires browser for initial authentication (acceptable for end users)
- More complex server implementation (already implemented)
- Not suitable for pure server-to-server (not our use case)

#### Canvas Access Strategy: Per-User API Keys

**Decision**: Users provide their Canvas API key during OAuth authentication, stored with their OAuth token.

**Rationale**:

- Works with free Cloudflare tier
- Works with any Canvas instance (any university)
- Users control their Canvas credentials
- No per-institution setup required
- Moderate implementation complexity

**Alternatives Considered**:

- Canvas OAuth integration: Too complex, requires per-institution setup
- Proxy mode: Less secure, API key in every request
- Single Canvas key: Doesn't support multiple users (rejected)

**Trade-offs**:

- Users must get Canvas API key (one-time setup)
- Users must manually rotate Canvas keys
- Canvas tokens don't auto-refresh (acceptable for this use case)

#### Deployment Platform: Cloudflare Workers

**Decision**: Deploy on Cloudflare Workers with KV storage and Durable Objects.

**Rationale**:

- Free tier supports 100+ users
- Global edge network (<50ms latency)
- Auto-scaling (handles traffic spikes)
- No server management
- Integrated KV and Durable Objects

**Costs** (for 100 active users):

- Cloudflare Workers: $0 (within free tier limits)
- Cloudflare KV: $0 (within free tier limits)
- Auth0 (if used): $0 (free tier: 7,000 users)
- **Total**: $0/month

### Key Technical Constraints

1. **Free Tier Limits**:
   - Cloudflare Workers: 100,000 requests/day
   - Cloudflare KV: 100,000 reads/day, 1,000 writes/day
   - Must stay within these for free operation

2. **Security Requirements**:
   - All communication over HTTPS
   - OAuth tokens expire (1h access, 30d refresh)
   - Per-user credential isolation
   - No shared secrets

3. **User Experience Goals**:
   - Setup time: <5 minutes
   - Browser needed: Only once for initial auth
   - Subsequent usage: Automatic, no extra steps

### Important Files for Context

**Architecture Documentation**:

- `CRITICAL_ARCHITECTURE_ISSUE.md` - Canvas API key architecture problem & solution
- `SECURITY_RECOMMENDATIONS.md` - Complete security analysis and fixes
- `MULTI_USER_OAUTH_ARCHITECTURE.md` - How multi-user OAuth works

**Implementation Guides**:

- `SECURITY_IMPLEMENTATION_CHECKLIST.md` - Step-by-step implementation checklist
- `OPTION_A_USER_GUIDE.md` - User experience guide for OAuth-only

**Code Locations**:

- OAuth handlers: `packages/remote-mcp-server-authless/src/oauth-handlers.ts`
- Authentication: `packages/remote-mcp-server-authless/src/index.ts:30-85`
- MCP tools: `packages/remote-mcp-server-authless/src/index.ts:93-550`
- OAuth config: `packages/remote-mcp-server-authless/src/oauth-config.ts`

**Configuration**:

- Worker config: `packages/remote-mcp-server-authless/wrangler.jsonc`
- KV namespaces: OAUTH_KV, API_KEYS_KV

### Testing Status

**Current Test Suite**: ✅ 14/14 tests passing

- OAuth flow tests: 9 passing
- Security tests: 5 passing
- Attack scenarios: 100% coverage

**Still Required**:

- Multi-user Canvas API key tests (after fix)
- Per-user data isolation tests (after fix)
- API key rejection tests (after security fix)

### Deployment Status

**Current Deployment**:

- URL: `https://canvas-mcp-sse.ariff.dev/sse`
- Status: Private testing
- Users: Single user (owner only)

**Blocking Issues for Public Release**:

1. Canvas API architecture fix (Issue 1)
2. API key security fix (Issue 2)

**Once Fixed**:

- Can support 100+ users
- Safe for public GitHub repository
- Ready for community use

### For Future AI Agents Working on This Project

When you start a new session, review these key points:

1. **Read this status section first** - Check deployment version and known issues
2. **Check CRITICAL_ARCHITECTURE_ISSUE.md** - Understand multi-user problem
3. **Review PERSONAL_AGENT.md** - Complete context and user preferences
4. **Test multi-user functionality** after any authentication changes
5. **Maintain OAuth security** - all 14 tests must pass
6. **Follow commit guidelines** - no AI markers in commits
7. **Check free tier limits** - must stay within Cloudflare free tier

---

## 📝 How to Use This File in Future Sessions

### For AI Assistants (Claude, Cursor, Copilot, etc.)

**When user says:**
- "Check the plan" or "What's the current status" → Read the "Current Project Status" section above
- "What needs to be fixed" → Refer to "Known Issues" section
- "How do I implement multi-user" → Direct them to `CRITICAL_ARCHITECTURE_ISSUE.md`
- "What's deployed" → Check "Latest Deploy" version and production URL

### For Ariff (The Owner)

**To update this file:**
```bash
# Open in editor
code /Users/ariff/canvas-student-mcp-server/canvas-student-mcp-server/AGENTS.md

# After major changes, update:
1. Latest Deploy version (from `wrangler deployments list`)
2. Known Issues (add/remove as you fix them)
3. What Works Now / What's Broken (keep current)
```

**When to reference this file:**
- Starting a new coding session
- After deploying to production
- When bringing new developers/AI assistants into the project
- Before making architectural changes

**Key sections to maintain:**
- ✅ **Current Project Status** - Update after every deployment
- ✅ **Recent Security Fixes** - Document security improvements
- ✅ **Known Issues** - Track remaining problems
- ✅ **Current Deployment Plan** - Your decision on next steps

---

**Last Updated:** 2025-10-15
**Status:** Pre-Public Release - Critical Issues Identified
4. **Test multi-user functionality** after any authentication changes
5. **Maintain OAuth security** - all 14 tests must pass
6. **Follow commit guidelines** - no AI markers in commits
7. **Check free tier limits** - must stay within Cloudflare free tier

### Current Session Context (2025-10-15)

**Work Completed**:

- ✅ Identified critical Canvas API architecture issue
- ✅ Identified API key security vulnerability
- ✅ Researched and documented solutions
- ✅ Created comprehensive implementation guides
- ✅ Analyzed free tier capacity (supports 100+ users)
- ✅ Tested connection to production server

**Decisions Made**:

- ✅ Use Option 1 (Per-User Canvas Keys) for Canvas API access
- ✅ Use Option A (OAuth-Only) for authentication security
- ✅ Target 100 users on free tier

**Next Steps**:

1. Implement Canvas API architecture fix (~6 hours)
2. Implement OAuth-only security fix (~1.5 hours)
3. Test with multiple Canvas accounts
4. Deploy and monitor

**User Goals**:

- Create public Canvas MCP server
- Support 100 users on free tier
- Maintain security and privacy
- Keep setup simple for end users
