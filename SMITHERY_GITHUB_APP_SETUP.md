# Smithery GitHub App Installation Guide

**Problem:** Smithery can't automatically rebuild because the GitHub App isn't installed or webhooks aren't configured.

**Evidence:**
- ❌ No webhooks configured on repository
- ❌ Smithery not receiving push notifications
- ✅ Code fixes are correct and pushed to main
- ⏳ Deployment stuck waiting for Smithery to be notified

---

## Step-by-Step: Install Smithery GitHub App

### Step 1: Visit Smithery and Login
1. Go to https://smithery.ai
2. Click **"Login"** button (top right)
3. Login with your GitHub account (`a-ariff`)
4. Authorize Smithery if prompted

### Step 2: Navigate to Your Server
1. Once logged in, go to your server page:
   - https://smithery.ai/server/@a-ariff/canvas-ai-assistant
2. You should see the "No deployments found" message
3. Look for a **"Settings"** or **"Configure"** tab/button

### Step 3: Install GitHub App (if not already installed)

**Option A: Via Smithery Dashboard**
1. Look for **"Connect Repository"** or **"Install GitHub App"** button
2. Click it - will redirect to GitHub
3. On GitHub, select where to install:
   - **Install on:** Select `a-ariff` (your account)
   - **Repository access:** Choose "Only select repositories"
   - **Select:** `canvas-student-mcp-server`
4. Click **"Install & Authorize"**
5. You'll be redirected back to Smithery

**Option B: Via GitHub Directly**
1. Visit https://github.com/apps/smithery-ai
2. Click **"Install"** button
3. Select your account: `a-ariff`
4. Choose repository access:
   - Select **"Only select repositories"**
   - Add: `canvas-student-mcp-server`
5. Click **"Install"**

### Step 4: Configure Deployment in Smithery

Once GitHub App is installed:

1. Return to https://smithery.ai/server/@a-ariff/canvas-ai-assistant
2. Look for **"Deploy"** or **"Publish"** or **"Rebuild"** button
3. Smithery should detect your `smithery.yaml` automatically
4. Review the detected configuration:
   - Name: `canvas-ai-assistant`
   - Runtime: `typescript`
   - Repository: `https://github.com/a-ariff/canvas-student-mcp-server`
5. Click **"Deploy"** or **"Publish"**

### Step 5: Monitor Build Progress

1. Smithery will start building your server
2. You should see:
   - **Build logs** showing npm install, tsc compilation, etc.
   - **Build status**: In Progress → Success/Failed
3. Build typically takes 1-3 minutes

**What Smithery does during build:**
```bash
# 1. Clone your repository
git clone https://github.com/a-ariff/canvas-student-mcp-server.git

# 2. Install dependencies
npm install

# 3. Build your code (using scripts in package.json)
npm run build  # This will run build:wrapper + build:mcp + build:api

# 4. Package the result
# Creates deployment bundle from dist/

# 5. Publish to registry
# Makes it available via: npx @smithery/cli install @a-ariff/canvas-ai-assistant
```

### Step 6: Verify Deployment Succeeded

Once build completes with **"Success"**:

**1. Check Smithery Page:**
```bash
curl -s https://smithery.ai/server/@a-ariff/canvas-ai-assistant | grep -i "no deployments"
```
- Should return NOTHING (no "No deployments found" text)

**2. Search Registry:**
```bash
npx @smithery/cli search canvas-ai-assistant
```
- Should show your server: `@a-ariff/canvas-ai-assistant`

**3. Test Installation:**
```bash
npx @smithery/cli install @a-ariff/canvas-ai-assistant --dry-run
```
- Should succeed without errors

**4. Clean Environment Test:**
```bash
docker run --rm node:20 bash -c "npx @smithery/cli install @a-ariff/canvas-ai-assistant"
```
- Should install successfully

---

## Troubleshooting

### Issue 1: Can't Find "Install App" Button

**Solution:**
- Visit https://github.com/apps/smithery-ai directly
- Click **"Configure"** if already installed
- Or click **"Install"** if not

### Issue 2: Build Fails with "Could not resolve @smithery/sdk"

**Check:**
```bash
cat package.json | grep -A3 "dependencies"
```

**Should show:**
```json
"dependencies": {
  "@smithery/sdk": "^1.6.3",
  "chalk": "^5.3.0"
}
```

**If missing:** We already fixed this - the issue should NOT occur.

### Issue 3: Build Fails with "Cannot find module './dist/index.js'"

**Check:**
```bash
cat package.json | grep "main"
```

**Should show:**
```json
"main": "./dist/index.js"
```

**If different:** We already fixed this - the issue should NOT occur.

### Issue 4: "private: true" Error

**Check:**
```bash
cat package.json | grep "private"
```

**Should show:** NOTHING (we removed it)

**If present:** We already removed it - the issue should NOT occur.

---

## Alternative: Manual Build Test Locally

If you want to verify the build works BEFORE pushing to Smithery:

```bash
# 1. Clean install (simulate Smithery environment)
rm -rf node_modules dist
npm install

# 2. Run build (what Smithery will run)
npm run build

# 3. Check output exists
ls -la dist/
# Should show: index.js

# 4. Test entry point
node dist/index.js
# Should spawn OAuth2 client (will fail to find package, but that's expected)
```

---

## Verification Checklist

**Before Claiming Success:**

- [ ] Smithery GitHub App is installed on your repository
- [ ] Deployment triggered and build completed with "Success"
- [ ] Smithery page does NOT show "No deployments found"
- [ ] Search finds your server: `npx @smithery/cli search canvas-ai-assistant`
- [ ] Installation works: `npx @smithery/cli install @a-ariff/canvas-ai-assistant`
- [ ] Clean Docker test passes
- [ ] Documentation updated to reflect actual success

**Only after ALL boxes are checked can you claim "Deployment complete"**

---

## Expected Timeline

| Step | Time |
|------|------|
| Install GitHub App | 2-3 minutes |
| Trigger deployment | 30 seconds |
| Build process | 1-3 minutes |
| Registry update | 30 seconds |
| **Total** | **~5 minutes** |

---

## Post-Deployment

Once deployment succeeds:

**1. Update SMITHERY_DEPLOYMENT_STATUS.md:**
```markdown
**Status:** ✅ DEPLOYED AND VERIFIED

**Verification Results:**
- ✅ Smithery page shows deployment info
- ✅ Registry search finds server
- ✅ Installation test passed
- ✅ Verified: [timestamp]
```

**2. Update README.md:**
Add installation instructions:
```markdown
## Installation

Install via Smithery:
\`\`\`bash
npx @smithery/cli install @a-ariff/canvas-ai-assistant
\`\`\`

Or visit: https://smithery.ai/server/@a-ariff/canvas-ai-assistant
```

**3. Commit Updates:**
```bash
git add SMITHERY_DEPLOYMENT_STATUS.md README.md
git commit -m "Update docs after successful Smithery deployment

- Confirm deployment verified and working
- Add Smithery installation instructions
- Update status to deployed"
git push origin main
```

---

## Summary

**Root Cause:** Smithery GitHub App not installed/configured
**Fix Required:** Manual installation via smithery.ai or github.com
**Expected Result:** Automatic builds on every push to main
**Verification:** External checks must ALL pass

**Don't claim success until you've run the verification commands and they ALL pass!**

---

**Next Action:** Go to https://smithery.ai, login, and follow the steps above.
