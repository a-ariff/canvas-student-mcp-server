# Docker Verification Guide

**Purpose:** Test Smithery deployment in clean environment using Docker

---

## Why Docker?

Testing with Docker ensures:
- ✅ No cached dependencies
- ✅ No local auth tokens
- ✅ No IDE configurations
- ✅ Clean npm install (what Smithery will do)
- ✅ Same as external user experience

---

## Prerequisites

```bash
# Install Docker (if not already installed)
# macOS:
brew install --cask docker

# Or download from: https://www.docker.com/products/docker-desktop

# Verify Docker is running
docker --version
```

---

## Test 1: Clean Build Test

Simulate what Smithery build platform does:

```bash
docker run --rm -it node:20 bash -c "
  # Clone your repo
  git clone https://github.com/a-ariff/canvas-student-mcp-server.git /tmp/test &&
  cd /tmp/test &&

  # Install dependencies (what Smithery does)
  npm install &&

  # Build (what Smithery does)
  npm run build &&

  # Check output
  ls -la dist/ &&
  echo '✅ Build succeeded in clean environment'
"
```

**Expected Result:**
- npm install completes without errors
- npm run build succeeds
- dist/index.js exists

**If it fails:**
- Check error messages
- Fix issues in repository
- Push fixes
- Test again

---

## Test 2: Smithery CLI Installation Test

Test if users can install from Smithery (after deployment):

```bash
docker run --rm -it node:20 bash -c "
  # Try installing via Smithery
  npx @smithery/cli install @a-ariff/canvas-ai-assistant &&
  echo '✅ Installation from Smithery succeeded'
"
```

**Expected Result:**
- Smithery CLI installs the server
- No errors
- Server is ready to use

**If it fails:**
- Check if Smithery deployment actually completed
- Visit: https://smithery.ai/server/@a-ariff/canvas-ai-assistant
- Should NOT show "No deployments found"

---

## Test 3: Package Integrity Test

Verify package.json configuration:

```bash
docker run --rm -v "$(pwd):/app" -w /app node:20 bash -c "
  # Check package.json
  cat package.json | grep -E 'private|main|module' &&

  # Verify no private flag
  ! grep -q '\"private\": true' package.json && echo '✅ Not private' &&

  # Verify main points to dist/
  grep -q '\"main\":.*dist/' package.json && echo '✅ Entry point correct'
"
```

**Expected Result:**
- No `"private": true` found
- Main field points to dist/ folder

---

## Test 4: Dependency Resolution Test

Ensure all dependencies install correctly:

```bash
docker run --rm -v "$(pwd):/app" -w /app node:20 bash -c "
  # Fresh install
  rm -rf node_modules package-lock.json &&
  npm install &&

  # Check required packages
  node -e \"require('@smithery/sdk')\" && echo '✅ @smithery/sdk found' &&
  node -e \"require('chalk')\" && echo '✅ chalk found'
"
```

**Expected Result:**
- All dependencies install
- Required packages can be imported

---

## Test 5: Build Output Test

Verify build output is correct:

```bash
docker run --rm -v "$(pwd):/app" -w /app node:20 bash -c "
  # Build
  npm run build:wrapper &&

  # Check output
  test -f dist/index.js && echo '✅ dist/index.js exists' &&
  node -e \"console.log(require('fs').statSync('dist/index.js').size + ' bytes')\" &&

  # Verify it's executable JavaScript
  node -c dist/index.js && echo '✅ Valid JavaScript'
"
```

**Expected Result:**
- dist/index.js created
- File size > 0 bytes
- Valid JavaScript syntax

---

## Test 6: Postinstall Guard Test

Test the postinstall script:

```bash
docker run --rm -v "$(pwd):/app" -w /app node:20 bash -c "
  # Install and run postinstall
  npm install &&
  npm run postinstall &&
  echo '✅ Postinstall guard passed'
"
```

**Expected Result:**
- Postinstall script runs
- Checks dependencies
- No errors

---

## Complete Verification Script

Run all tests in sequence:

```bash
#!/bin/bash
# save as: test-docker-verification.sh

set -e  # Exit on any error

echo "🐳 Starting Docker verification tests..."
echo ""

echo "Test 1: Clean Build Test"
docker run --rm node:20 bash -c "
  git clone https://github.com/a-ariff/canvas-student-mcp-server.git /tmp/test &&
  cd /tmp/test &&
  npm install &&
  npm run build &&
  test -f dist/index.js
" && echo "✅ Test 1 passed" || echo "❌ Test 1 failed"

echo ""
echo "Test 2: Package Configuration Test"
docker run --rm -v "$(pwd):/app" -w /app node:20 bash -c "
  ! grep -q '\"private\": true' package.json &&
  grep -q '\"main\":.*dist/' package.json
" && echo "✅ Test 2 passed" || echo "❌ Test 2 failed"

echo ""
echo "Test 3: Dependency Resolution Test"
docker run --rm -v "$(pwd):/app" -w /app node:20 bash -c "
  rm -rf node_modules &&
  npm install &&
  node -e \"require('@smithery/sdk')\" &&
  node -e \"require('chalk')\"
" && echo "✅ Test 3 passed" || echo "❌ Test 3 failed"

echo ""
echo "Test 4: Build Output Test"
docker run --rm -v "$(pwd):/app" -w /app node:20 bash -c "
  npm run build:wrapper &&
  test -f dist/index.js &&
  node -c dist/index.js
" && echo "✅ Test 4 passed" || echo "❌ Test 4 failed"

echo ""
echo "🎉 All Docker verification tests completed!"
```

**Usage:**
```bash
chmod +x test-docker-verification.sh
./test-docker-verification.sh
```

---

## When to Run These Tests

**Before pushing to GitHub:**
- Run Test 1, 2, 3, 4 locally
- Ensure all pass

**After pushing to GitHub:**
- Wait for Smithery build
- Run Test 2 (Smithery CLI installation)

**When debugging issues:**
- Run specific tests to isolate problems
- Check Docker logs for detailed errors

---

## Troubleshooting

### Issue: "Cannot find module @smithery/sdk"

**Cause:** Dependency not installed or in wrong section

**Fix:**
```bash
# Check package.json
cat package.json | grep -A5 "dependencies"

# Should show @smithery/sdk in dependencies (not devDependencies)
```

### Issue: "dist/index.js not found"

**Cause:** Build failed or not run

**Fix:**
```bash
# Run build manually
npm run build:wrapper

# Check for errors
# Fix issues
# Test again
```

### Issue: "private: true blocks publishing"

**Cause:** package.json has private flag

**Fix:**
```bash
# Remove private field
# Or set to false
# Commit and push
```

---

## Success Criteria

ALL tests must pass:

- [x] Clean build succeeds in Docker
- [x] No "private: true" in package.json
- [x] All dependencies install correctly
- [x] Build outputs dist/index.js
- [x] Postinstall guard passes
- [ ] Smithery CLI installation works (after deployment)

---

**Last Updated:** October 31, 2025
**Purpose:** Ensure deployment works in clean environment
