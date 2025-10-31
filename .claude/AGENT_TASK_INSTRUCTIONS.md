# Agent Task Instructions

## Purpose

This document provides comprehensive guidelines for AI assistants working on this codebase to avoid common mistakes and ensure thorough task completion. Created after the Smithery deployment failure analysis (October 31, 2025).

## Quick Reference

**Before Starting ANY Task:**
- [ ] What does "complete" mean for THIS task?
- [ ] Does this involve external systems that need verification?
- [ ] What would a user expect to be able to DO after this is "done"?
- [ ] What's the verification command that proves success?

**Before Claiming Success:**
- [ ] Ran verification command?
- [ ] Tested from clean environment?
- [ ] Checked external systems?
- [ ] Could external user follow docs and succeed?

---

## Section 1: Task Understanding Protocol

### 1.1 Scope Clarification

When a user requests a task, immediately determine the full scope:

**For Deployment Tasks:**
```
"Deploy to [platform]" ALWAYS includes:
1. Internal fixes (code, config, files)
2. Platform registration/publication
3. Public accessibility verification
4. Installation testing from clean environment
5. Documentation updates
```

**For "Fix" Tasks:**
```
"Fix [issue]" ALWAYS includes:
1. Root cause identification
2. Fix implementation
3. Verification that fix works
4. Check for related issues
5. Update documentation
```

### 1.2 Success Criteria Definition

Never assume success criteria. Always explicitly define what "complete" means:

| Task Type | Success Criteria Example |
|-----------|--------------------------|
| **Smithery Deployment** | Server appears at smithery.ai/server/@user/name AND `npx @smithery/cli install @user/name` succeeds in clean environment |
| **Bug Fix** | Error no longer occurs AND no new errors introduced AND tests pass |
| **Feature Addition** | Feature works as specified AND documented AND tests added |
| **Documentation Update** | All commands execute successfully AND links work AND matches system behavior |

### 1.3 Red Flags Indicating Scope Misunderstanding

**Stop and clarify if:**
- User says "fix the Smithery deployment" but you're only editing config files
- User says "make it work" but you're only updating documentation
- User asks about "issues" but you only address the first error you find
- Task mentions deployment but you haven't tested external accessibility

---

## Section 2: Deep Investigation Protocol

### 2.1 Verify ACTUAL Current State

**Never trust existing documentation as source of truth.**

For deployment tasks, ALWAYS check external systems:

```bash
# Example: Smithery deployment verification
curl https://smithery.ai/server/@username/package-name
# Look for: "No deployments found" vs actual deployment info

npx @smithery/cli search package-name
# Should return YOUR package, not unrelated ones

# Test installation
docker run --rm node:20 bash -c "npx @smithery/cli install @username/package-name"
```

### 2.2 Find ALL Related Files

**Systematic search protocol:**

```bash
# 1. Find all config files
find . -name "*[keyword]*" -type f

# 2. Find all documentation
grep -r "[keyword]" *.md docs/

# 3. Find all scripts
find . -name "*.sh" -o -name "*.yml" | xargs grep -l "[keyword]"

# 4. Check for duplicate configs (common in monorepos)
find . -name "smithery.yaml" -o -name "package.json"
```

### 2.3 Trace Errors to Root Cause

**Don't stop at surface-level errors. Example:**

```
Surface Error: "Could not resolve @smithery/sdk"
↓
Dig Deeper: Why can't it resolve?
↓
Find: npm ci is running instead of npm install
↓
Root Cause: package-lock.json present causes npm ci
↓
Solution: Update package-lock.json OR remove it
```

### 2.4 Documentation Audit

**For each document mentioning the task:**

```markdown
[ ] Does it claim something is "working"?
    → Run verification command to confirm

[ ] Does it provide installation instructions?
    → Follow them in clean Docker container

[ ] Does it reference URLs/endpoints?
    → curl each one to verify they work

[ ] Does it claim "Fixed" or "Complete"?
    → Check git commits after that date for reverts/fixes
```

---

## Section 3: Common False Positives

### 3.1 Things That DO NOT Indicate Success

❌ **"Build completed successfully" in logs**
   - CHECK: Did it actually deploy to target platform?
   - CHECK: Can external users access it?

❌ **"Deployment succeeded" message**
   - CHECK: Does the service respond to requests?
   - CHECK: Does the registry show the package?

❌ **Package appears in registry**
   - CHECK: Can it be installed?
   - CHECK: Does it run without errors?

❌ **Service responds to curl**
   - CHECK: Do all endpoints work?
   - CHECK: Does OAuth flow complete?

❌ **Documentation says "Ready"**
   - CHECK: Can someone follow docs from scratch and succeed?

### 3.2 Smithery-Specific False Positives

❌ **smithery.yaml exists in root**
   - CHECK: Is package.json configured correctly?
   - CHECK: Is there a buildable entry point?
   - CHECK: Does `npm run build` work?

❌ **Server page exists on smithery.ai**
   - CHECK: Does it say "No deployments found"?
   - CHECK: Can you actually install it?

---

## Section 4: External System Verification

### 4.1 Clean Environment Testing

**Why it matters:**
- Your local env has cached dependencies
- Your local env has auth tokens
- Your local env has IDE configurations
- External users won't have any of this

**Testing protocol:**

```bash
# Use Docker for truly clean environment
docker run --rm -it node:20 bash -c "
  npx @smithery/cli install @username/package-name &&
  echo 'Installation succeeded!'
"
```

### 4.2 Platform-Specific Checks

**For Smithery:**

```bash
# 1. Check if server is published
curl https://smithery.ai/server/@username/package-name | grep -i "no deployments"

# 2. Search registry
npx @smithery/cli search package-name

# 3. Try installation
npx @smithery/cli install @username/package-name --dry-run
```

**For npm:**

```bash
# 1. Check package exists
npm view @username/package-name

# 2. Try installation
npm install @username/package-name --dry-run
```

---

## Section 5: Configuration Checklist

### 5.1 Smithery Deployment Requirements

**File Checklist:**

- [ ] `smithery.yaml` in repository root
- [ ] `smithery.yaml` has `runtime: typescript` or appropriate runtime
- [ ] `package.json` exists with correct configuration
- [ ] `package.json` has `"private": false` (or no private field)
- [ ] `package.json` has correct `"module"` or `"main"` pointing to built file
- [ ] `package.json` includes all dependencies (not devDependencies)
- [ ] Source code exists at expected location
- [ ] Build output exists (dist/ folder for TypeScript)
- [ ] `npm run build` succeeds without errors
- [ ] Entry point file is executable

**package.json for Smithery:**

```json
{
  "name": "package-name",
  "version": "1.0.0",
  "private": false,  // MUST be false or omitted
  "main": "./dist/index.js",  // Must point to BUILT file
  "scripts": {
    "build": "tsc"  // Must have working build script
  },
  "dependencies": {
    "@smithery/sdk": "^1.6.3",  // NOT in devDependencies
    // ... other runtime deps
  }
}
```

### 5.2 Common Configuration Mistakes

**Mistake 1: `"private": true` in package.json**
```json
// ❌ WRONG - prevents publishing
{
  "private": true
}

// ✅ CORRECT
{
  "private": false
  // or omit the field entirely
}
```

**Mistake 2: Module pointing to source instead of built file**
```json
// ❌ WRONG - Smithery can't run TypeScript directly
{
  "module": "./src/index.ts"
}

// ✅ CORRECT
{
  "module": "./dist/index.js"
}
```

**Mistake 3: Dependencies in devDependencies**
```json
// ❌ WRONG - won't be installed in production
{
  "devDependencies": {
    "@smithery/sdk": "^1.6.3"
  }
}

// ✅ CORRECT
{
  "dependencies": {
    "@smithery/sdk": "^1.6.3"
  }
}
```

---

## Section 6: Communication Guidelines

### 6.1 Honest Status Reporting

**Use specific language:**

✅ **GOOD:**
```
"Completed configuration changes. Testing deployment..."
[runs verification]
"Verification failed: server shows 'No deployments found'.
Investigating build process..."
```

❌ **BAD:**
```
"Fixed the Smithery deployment! ✅"
[without actually verifying it works]
```

### 6.2 Status Templates

**When partially complete:**
```
Progress update:
✅ Completed: [specific tasks]
⏳ In progress: [current task]
❌ Blocked: [specific blocker]
📋 Remaining: [tasks]
```

**When encountering errors:**
```
Error found: [specific error message]
Root cause: [analysis]
Attempted fix: [what you tried]
Result: [success/failure]
Next step: [plan]
```

**When claiming success:**
```
Task complete. Verification:
✅ [verification 1]: [command] returned [expected result]
✅ [verification 2]: [specific check] passed
✅ [verification 3]: External user can [specific action]
```

### 6.3 Red Zone Phrases

**Use with extreme caution:**
- "Fixed!" → Say: "Fix applied. Verifying..."
- "Complete!" → Say: "Implementation complete. Testing..."
- "Working!" → Say: "Functioning locally. Testing in clean environment..."
- "Ready for production" → Say: "Deployed. Running production verification..."

---

## Section 7: Case Study - The Smithery Deployment Failure

### 7.1 What Actually Happened

**The Facts:**
1. Server page existed at `https://smithery.ai/server/@a-ariff/canvas-ai-assistant`
2. Page showed: **"No deployments found"**
3. Server did NOT appear in search results
4. Installation failed with errors

**The Mistakes:**
1. ✅ smithery.yaml was in root → Assumed task complete
2. ✅ src/index.ts existed → Assumed build works
3. ❌ Never checked if page showed "No deployments found"
4. ❌ Never tested installation in clean environment
5. ❌ Never built the TypeScript code (no dist/ folder)
6. ❌ Didn't notice `"private": true` in package.json
7. ❌ Didn't notice `"module"` pointing to .ts instead of .js

**The Real Issues:**
- `package.json` had `"private": true` (blocks publishing)
- `package.json` `"module"` pointed to source (src/index.ts) not built file
- No build script run (no dist/ folder existed)
- No verification that Smithery build succeeded

### 7.2 Correct Approach

**What SHOULD have been done:**

```bash
# Step 1: Check actual current state
curl https://smithery.ai/server/@a-ariff/canvas-ai-assistant
# Would have revealed: "No deployments found"

# Step 2: Verify package.json configuration
cat package.json | grep -E "private|module|main"
# Would have found: "private": true, "module": "./src/index.ts"

# Step 3: Check if build output exists
ls dist/
# Would have found: directory doesn't exist

# Step 4: Try building
npm run build
# Would have found: no build script for root package

# Step 5: Fix issues
#  - Remove "private": true
#  - Change "module" to "./dist/index.js"
#  - Add build script
#  - Run build

# Step 6: Test locally
node dist/index.js
# Verify it runs

# Step 7: Trigger Smithery rebuild
# (push changes, Smithery rebuilds automatically)

# Step 8: Verify deployment
curl https://smithery.ai/server/@a-ariff/canvas-ai-assistant
# Should NOW show deployment info (not "No deployments found")

# Step 9: Test installation
docker run --rm node:20 bash -c "npx @smithery/cli install @a-ariff/canvas-ai-assistant"
# Should succeed

# Step 10: ONLY NOW can you claim success
```

---

## Section 8: Commit Guidelines

### 8.1 Natural Commit Messages

**Write commits as if YOU (the human) wrote them.**

❌ **BAD (AI markers):**
```
Fix Smithery deployment configuration

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

✅ **GOOD (natural):**
```
Fix Smithery deployment configuration

- Remove private flag from package.json
- Update module path to built output
- Add root-level build script
```

### 8.2 Commit Message Style

**Format:**
```
Short summary (50 chars or less)

- Bullet point 1
- Bullet point 2
- Bullet point 3
```

**Examples:**

```
Update package.json for Smithery publishing

- Set private to false
- Point module to dist/index.js
- Move @smithery/sdk to dependencies
```

```
Add TypeScript build configuration

- Create tsconfig.json for root package
- Add build script to compile wrapper
- Generate dist/index.js output
```

---

## Final Checklist

**Before claiming ANY task is complete:**

1. [ ] Verified with external system checks
2. [ ] Tested in clean environment (Docker)
3. [ ] All documentation is accurate
4. [ ] No AI markers in commits
5. [ ] All files committed with natural messages
6. [ ] Can external user follow docs and succeed?

**If you can't check ALL boxes above, the task is NOT complete.**

---

## Quick Decision Tree

```
User requests task
    ↓
Does it involve external platform? → YES → Must verify external accessibility
    ↓                                  ↓
    NO                                 Verify platform shows deployment
    ↓                                  ↓
Implement changes                      Test installation in clean env
    ↓                                  ↓
Test locally                           All pass? → Complete
    ↓                                  ↓
Works locally? → YES                   Any fail? → Keep investigating
    ↓            ↓
    NO           Document changes
    ↓            ↓
Debug more      Commit with natural messages
                ↓
                Verify docs match reality
                ↓
                ONLY NOW claim success
```

---

**Remember:** It's better to say "still working on it" than to claim premature success and have to come back to fix it again.

**Created:** October 31, 2025
**Purpose:** Prevent repeat of Smithery deployment failures
**Applies to:** All AI assistants working on this codebase
