# Smithery Submission Guide

This guide explains how to submit the Canvas Student MCP Server to Smithery's registry.

## Prerequisites

- ✅ `smithery.yaml` in repository root (already configured)
- ✅ Working OAuth 2.1 server at `canvas-mcp-sse.ariff.dev`
- ✅ GitHub repository with proper structure
- ✅ Server configuration and documentation

## Automated Submission Process

### Method 1: GitHub Actions Workflow

The repository includes an automated workflow that validates and prepares your submission:

```bash
# Trigger manually
gh workflow run smithery-submission.yml

# Or push changes to trigger automatically
git push origin main
```

The workflow will:
1. Validate `smithery.yaml` structure
2. Check server connectivity
3. Create submission records
4. Open an issue with manual verification steps

### Method 2: Submission Helper Script

Use the included helper script for local submission preparation:

```bash
# Run the submission helper
./scripts/smithery-submit.sh
```

The script will:
- Verify smithery.yaml location
- Test server connectivity
- Check OAuth endpoints
- Create submission records
- Guide you through manual steps

## Manual Submission Steps

1. **Visit Smithery.ai**
   - Go to [https://smithery.ai](https://smithery.ai)
   - Sign in or create an account

2. **Submit Your Server**
   - Click "Submit Server" or "Add Server"
   - Provide repository URL: `https://github.com/a-ariff/canvas-student-mcp-server`
   - Smithery will automatically detect `smithery.yaml`

3. **Verification**
   - Smithery will validate your configuration
   - Test the OAuth flow
   - Verify server connectivity

4. **Publication**
   - Once approved, your server will be listed in the registry
   - Users can discover and install it via Smithery CLI

## Configuration Details

### smithery.yaml Location

The `smithery.yaml` file MUST be in the repository root for Smithery to detect it:

```
canvas-student-mcp-server/
├── smithery.yaml          ← Required location
├── packages/
│   └── remote-mcp-server-authless/
│       └── smithery.yaml  ← Original source (keep as backup)
└── ...
```

### Server Configuration

```yaml
name: canvas-student-mcp
version: "3.0.0"
remote:
  transport:
    type: sse
    url: https://canvas-mcp-sse.ariff.dev/sse
  authentication:
    type: oauth2
    discovery_url: https://canvas-mcp-sse.ariff.dev/.well-known/oauth-authorization-server
```

## Troubleshooting

### Issue: Smithery can't find smithery.yaml

**Solution**: Ensure `smithery.yaml` is in the repository root, not in a subdirectory.

```bash
# Fix location
cp packages/remote-mcp-server-authless/smithery.yaml ./smithery.yaml
git add smithery.yaml
git commit -m "fix: move smithery.yaml to repository root"
git push
```

### Issue: OAuth discovery endpoint not accessible

**Solution**: Verify the OAuth discovery URL returns proper JSON:

```bash
curl https://canvas-mcp-sse.ariff.dev/.well-known/oauth-authorization-server
```

Expected response should include:
- `authorization_endpoint`
- `token_endpoint`
- `code_challenge_methods_supported`

### Issue: Server not reachable

**Solution**: Check server status and CORS configuration:

```bash
curl -I https://canvas-mcp-sse.ariff.dev/sse
```

## Smithery CLI Commands

If you have Smithery CLI installed:

```bash
# Search for Canvas servers
smithery search canvas

# Inspect a server
smithery inspect @a-ariff/canvas-student-mcp

# Install locally for testing
smithery install @a-ariff/canvas-student-mcp

# Run the server
smithery run @a-ariff/canvas-student-mcp
```

## Verification Checklist

Before submission, ensure:

- [ ] `smithery.yaml` is in repository root
- [ ] Server is accessible at `canvas-mcp-sse.ariff.dev`
- [ ] OAuth discovery endpoint returns valid JSON
- [ ] Repository is public on GitHub
- [ ] README.md contains usage instructions
- [ ] All dependencies are properly declared
- [ ] Version number is updated if needed

## Support

For issues with:
- **Smithery Platform**: Visit [Smithery Documentation](https://smithery.ai/docs)
- **Canvas MCP Server**: Open an issue on [GitHub](https://github.com/a-ariff/canvas-student-mcp-server)
- **OAuth Configuration**: Check the OAuth setup guide in `/docs/OAUTH_SETUP.md`

## Monitoring Submission

After submission:

1. **Check Smithery Registry**
   ```bash
   smithery search "canvas-student-mcp"
   ```

2. **Monitor GitHub Issues**
   - Automated workflow creates tracking issues
   - Check for Smithery verification comments

3. **Test Installation**
   ```bash
   smithery install @a-ariff/canvas-student-mcp
   smithery run @a-ariff/canvas-student-mcp
   ```

## Update Process

When updating your server:

1. Update version in `smithery.yaml`
2. Commit and push changes
3. Smithery automatically detects updates
4. Users get notified of new versions

## Best Practices

- Keep `smithery.yaml` synchronized with actual server capabilities
- Update version numbers following semantic versioning
- Test OAuth flow before each submission
- Document any breaking changes in CHANGELOG.md
- Maintain backward compatibility when possible

## Related Documentation

- [OAuth Implementation](./OAUTH_SETUP.md)
- [Server Architecture](../MULTI_USER_OAUTH_ARCHITECTURE.md)
- [Deployment Guide](../DEPLOYMENT_OPTIONS.md)
- [API Documentation](./API_REFERENCE.md)