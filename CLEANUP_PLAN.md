# Repository Cleanup Plan

## Overview
This plan identifies files and directories to remove, consolidate, or update in the canvas-student-mcp-server repository.

## Files to Delete

### 1. Backup and Temporary Files
```bash
# Remove backup files
rm .DS_Store
rm packages/canvas-student-mcp-server/app.py.bak
rm packages/canvas-student-mcp-server/src/mcp_server/canvas_mcp.py.bak
```

**Reason**: `.bak` files are development artifacts, `.DS_Store` is macOS system file (should be in .gitignore)

### 2. Duplicate Configuration Files (Root Level)
```bash
# Keep: claude_desktop_config.example.json (template)
# Remove: claude-desktop-config.json (duplicate)
rm claude-desktop-config.json
```

**Reason**: Having two similar config examples is confusing. Keep the one with `example` in the name.

### 3. Test Files No Longer Needed
```bash
# Review and potentially remove:
rm test_code_runner.py  # If no longer used
rm packages/canvas-student-mcp-server/test-workflows.md  # If deprecated
```

**Reason**: Test files at root level suggest legacy development. Move to proper test directory or remove if obsolete.

### 4. Deprecated Python Files
```bash
# Remove Python server files (replaced by TypeScript version)
rm packages/canvas-student-mcp-server/app.py
rm packages/canvas-student-mcp-server/simple_fastmcp_server.py
```

**Reason**: The project has migrated to TypeScript. Python versions are legacy.

### 5. Unused Smithery YAML
```bash
# Check if still needed, if not:
rm packages/remote-mcp-server-authless/smithery.yaml
```

**Reason**: You mentioned using External MCP deployment instead of GitHub deployment.

---

## Packages to Evaluate

### Package: `canvas-student-mcp-smithery`
**Status**: ⚠️ Review needed
**Location**: `packages/canvas-student-mcp-smithery/`

**Questions**:
- Is this actively being used for Smithery deployment?
- Is it a duplicate of another package?
- Contains only smithery.yaml with `runtime: typescript`

**Recommendation**:
- If unused, remove entire directory
- If used, merge with main canvas-student-mcp-server package
- Document its purpose if keeping

### Package: `cloudflare-canvas-api`
**Status**: ✅ Keep
**Purpose**: Cloudflare Workers proxy for Canvas API

**Action**: None - appears to be a separate, useful component

### Package: `remote-mcp-server-authless`
**Status**: ✅ Keep (Active - deployed to production)
**Purpose**: Remote MCP server deployed at canvas-mcp-sse.ariff.dev

**Action**:
- Keep, this is your production remote server
- Remove smithery.yaml if not using GitHub deployment

---

## Documentation to Consolidate

### Multiple README files
**Current**:
- Root `README.md`
- `packages/canvas-student-mcp-server/README.md`
- `packages/cloudflare-canvas-api/README.md`
- `packages/remote-mcp-server-authless/README.md`

**Recommendation**:
- Root README: Overview + links to package-specific docs
- Package READMEs: Keep detailed, package-specific instructions
- ✅ Structure is good, no changes needed

### Setup Documentation
**Current**:
- `CLAUDE_DESKTOP_SETUP.md` (root)
- `packages/canvas-student-mcp-server/MCP_INTEGRATION.md`
- `packages/canvas-student-mcp-server/DOCKER_TESTING.md`

**Recommendation**:
- Keep all - they serve different purposes
- Consider adding cross-references

---

## .gitignore Updates Needed

Add to root `.gitignore`:
```
# macOS
.DS_Store

# Backup files
*.bak
*.backup
*~
*.swp

# Environment files
.env.local
.env.*.local

# Test files
test_code_runner.py

# Legacy
packages/canvas-student-mcp-server/app.py
packages/canvas-student-mcp-server/simple_fastmcp_server.py
```

---

## Summary of Actions

### High Priority (Safe to delete)
1. ✅ Delete `.DS_Store`
2. ✅ Delete `*.bak` files
3. ✅ Remove duplicate `claude-desktop-config.json` (keep `claude_desktop_config.example.json`)
4. ✅ Update `.gitignore`

### Medium Priority (Verify first)
5. ⚠️ Evaluate `packages/canvas-student-mcp-smithery/` - is it needed?
6. ⚠️ Remove Python files (`app.py`, `simple_fastmcp_server.py`) if no longer needed
7. ⚠️ Remove `test_code_runner.py` if obsolete
8. ⚠️ Check if `packages/remote-mcp-server-authless/smithery.yaml` is needed

### Low Priority (Document or restructure)
9. 📝 Add package descriptions to root README
10. 📝 Document purpose of each package
11. 📝 Add architecture diagram

---

## Packages Structure (After Cleanup)

```
canvas-student-mcp-server/
├── packages/
│   ├── canvas-student-mcp-server/    # Main local MCP server (TypeScript)
│   ├── remote-mcp-server-authless/   # Remote MCP server (Cloudflare Workers)
│   └── cloudflare-canvas-api/        # Canvas API proxy (Cloudflare Workers)
├── .github/workflows/                 # CI/CD
├── README.md                          # Main documentation
├── CLAUDE_DESKTOP_SETUP.md           # Setup guide
├── claude_desktop_config.example.json # Config template
└── package.json                       # Workspace root
```

**Removed**:
- ❌ `packages/canvas-student-mcp-smithery/` (if unused)
- ❌ Python files (legacy)
- ❌ Backup files
- ❌ Test files at root

---

## Execution Commands

```bash
# Step 1: Backup current state
git add -A
git commit -m "Checkpoint before cleanup"

# Step 2: Remove safe deletions
rm .DS_Store
rm packages/canvas-student-mcp-server/app.py.bak
rm packages/canvas-student-mcp-server/src/mcp_server/canvas_mcp.py.bak
rm claude-desktop-config.json

# Step 3: Review and decide on these
# ls packages/canvas-student-mcp-smithery/  # Check if needed
# ls packages/canvas-student-mcp-server/app.py  # Check if still used
# ls test_code_runner.py  # Check if needed

# Step 4: Update .gitignore (manual edit)
# Add entries listed above

# Step 5: Commit cleanup
git add -A
git commit -m "chore: Clean up backup files, duplicates, and update .gitignore"
git push origin main
```

---

## Post-Cleanup Validation

After cleanup, verify:

1. ✅ Local MCP server still works: `cd packages/canvas-student-mcp-server && npm run build`
2. ✅ Remote server still deploys: `cd packages/remote-mcp-server-authless && npm run deploy`
3. ✅ Claude Desktop connection works
4. ✅ Smithery deployment works (if using)
5. ✅ All CI/CD workflows pass

---

## Notes

- **Main Package**: `packages/canvas-student-mcp-server/` is your primary local MCP server with 16 tools
- **Remote Package**: `packages/remote-mcp-server-authless/` is deployed at `https://canvas-mcp-sse.ariff.dev`
- **Keep Both**: They serve different purposes (local vs remote)
- **Smithery Package**: Needs evaluation - appears to be minimal/unused

---

*Generated on 2025-10-05 by Claude Code cleanup analysis*
