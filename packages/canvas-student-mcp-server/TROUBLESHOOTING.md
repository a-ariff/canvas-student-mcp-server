# 🔧 Troubleshooting Guide

This comprehensive guide covers common issues, debugging techniques, and
solutions for the Canvas Student MCP Server.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Authentication Problems](#authentication-problems)
- [Connection Issues](#connection-issues)
- [Canvas-Specific Problems](#canvas-specific-problems)
- [MCP Integration Issues](#mcp-integration-issues)
- [Performance Problems](#performance-problems)
- [Common Error Messages](#common-error-messages)
- [Getting Help](#getting-help)
## Installation Issues

### Python Version Problems

**Problem**: `SyntaxError` or `ModuleNotFoundError` during installation

**Solution**:

```bash
# Check Python version (must be 3.9+)
python --version

# If version is too old, install Python 3.9+
# On macOS with Homebrew:
brew install python@3.11

# On Ubuntu/Debian:
sudo apt update
sudo apt install python3.11 python3.11-pip

# Use specific Python version
python3.11 -m pip install -r requirements.txt
```

### Missing Dependencies

**Problem**: Import errors when starting the server

**Solution**:

```bash
# Reinstall all dependencies
pip install --upgrade -r requirements.txt

# If issues persist, use virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Permission Issues

**Problem**: Permission denied when installing packages

**Solution**:

```bash
# Use user installation
pip install --user -r requirements.txt

# Or create virtual environment (recommended)
python -m venv canvas_mcp_env
source canvas_mcp_env/bin/activate  # On Windows: canvas_mcp_env\Scripts\activate
pip install -r requirements.txt
```

## Authentication Problems

### Invalid Credentials

**Problem**: `HTTP 401 Unauthorized` or login failures

**Common Causes**:

1. **Two-Factor Authentication (2FA)**: Canvas 2FA is not supported by this tool
2. **Incorrect username/password**: Double-check credentials
3. **Special characters**: URL-encode special characters in credentials
4. **Institution-specific login**: Some schools use SSO/SAML
**Solutions**:

```bash
# Test credentials manually by logging into Canvas web interface

# For special characters in password, URL encode them:
# @ becomes %40
# # becomes %23
# & becomes %26
# etc.

# Example .env file with encoded password:
CANVAS_USERNAME=student@university.edu
CANVAS_PASSWORD=mypass%40123
```

**2FA Workaround**:

1. Temporarily disable 2FA if possible
2. Use app-specific password if your institution supports it
3. Contact IT department for API access token
### Session Timeouts

**Problem**: `Session expired` errors during operation

**Solution**:

```python
# Add to .env file
SESSION_TIMEOUT=3600  # 1 hour
AUTO_REFRESH=true
```

## Connection Issues

### Network Connectivity

**Problem**: `Connection refused` or `Timeout` errors

**Diagnostic Steps**:

```bash
# Test Canvas URL accessibility
curl -I https://your-school.instructure.com

# Check if running behind proxy
echo $HTTP_PROXY
echo $HTTPS_PROXY

# Test DNS resolution
nslookup your-school.instructure.com
```

**Solutions**:

```bash
# For proxy environments, add to .env:
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=https://proxy.company.com:8080

# For firewall issues, whitelist Canvas domains:
# *.instructure.com
# *.canvaslms.com
```

### SSL Certificate Issues

**Problem**: `SSL: CERTIFICATE_VERIFY_FAILED`

**Solutions**:

```bash
# Update certificates
# On macOS:
/Applications/Python\ 3.x/Install\ Certificates.command

# On Ubuntu/Debian:
sudo apt-get update && sudo apt-get install ca-certificates

# Temporary workaround (NOT recommended for production):
# Add to .env:
SSL_VERIFY=false
```

## Canvas-Specific Problems

### Unsupported Canvas Version

**Problem**: API endpoints return `404` or unexpected responses

**Solution**:

```bash
# Check Canvas version
curl https://your-school.instructure.com/api/v1/

# Update API endpoints in src/canvas_client.py if needed
# Most Canvas instances support API v1
```

### Rate Limiting

**Problem**: `HTTP 429 Too Many Requests`

**Solution**:

```bash
# Reduce request rate in .env:
RATE_LIMIT=30  # Requests per minute (default: 60)
REQUEST_DELAY=2  # Seconds between requests
```

### Course Access Issues

**Problem**: Cannot access specific courses or get empty course lists

**Common Causes**:

1. Student not enrolled in course
2. Course is unpublished
3. Course access is restricted
4. Wrong semester/term
**Diagnostic**:

```bash
# Test API endpoint directly
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-school.instructure.com/api/v1/courses
```

## MCP Integration Issues

### Claude Desktop Integration

**Problem**: Claude Desktop doesn't recognize the MCP server

**Solution**:

1. **Check server status**:

   ```bash
   # Ensure server is running
   curl http://localhost:8000/health
   ```

2. **Verify Claude Desktop config**:

   ```json
   {
     "mcpServers": {
       "canvas-student": {
         "command": "python",
         "args": ["/path/to/canvas-student-mcp-server/app.py"],
         "env": {
           "CANVAS_URL": "https://your-school.instructure.com",
           "CANVAS_USERNAME": "your-username",
           "CANVAS_PASSWORD": "your-password"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop** after config changes
### Port Conflicts

**Problem**: `Address already in use` error

**Solution**:

```bash
# Find process using port 8000
lsof -i :8000  # On macOS/Linux
netstat -ano | findstr :8000  # On Windows

# Kill the process or change port in .env:
PORT=8001
```

### MCP Protocol Errors

**Problem**: `Invalid MCP message` or protocol errors

**Solution**:

1. **Update MCP dependencies**:

   ```bash
   pip install --upgrade mcp anthropic-sdk
   ```

2. **Check MCP server logs**:

   ```bash
   python app.py --debug
   ```

### JSON-RPC Protocol Errors (Claude Desktop)

**Problem**: `Unexpected token '�', "🧹 Cache c"... is not valid JSON` or similar parsing errors

**Cause**: The MCP server is outputting non-JSON content to stdout, which breaks the JSON-RPC protocol. Console output methods like `console.log()` and `console.debug()` write to stdout, while Claude Desktop expects only valid JSON-RPC messages.

**Solution**:

1. **For TypeScript/Node.js servers**: Replace all `console.log()` and `console.debug()` with `console.error()`:

   ```typescript
   // ❌ Wrong - writes to stdout, breaks protocol
   console.log('Server started');
   console.debug('Cache cleanup');

   // ✅ Correct - writes to stderr
   console.error('Server started');
   console.error('Cache cleanup');
   ```

2. **Check your code**:

   ```bash
   # Find problematic console statements
   grep -rn "console\.log\|console\.debug" src/
   ```

3. **Rebuild and restart**:

   ```bash
   npm run build
   # Restart Claude Desktop
   ```

**Why this happens**:
- MCP servers use stdio for JSON-RPC communication
- stdin/stdout = JSON-RPC messages only
- stderr = logging, debugging, informational output
- Any non-JSON to stdout breaks the protocol

**Common affected files**:
- Cache implementations
- API clients with request logging
- Startup/initialization scripts
## Performance Problems

### Slow Response Times

**Problem**: Server takes too long to respond

**Solutions**:

1. **Enable caching** in .env:

   ```bash
   ENABLE_CACHE=true
   CACHE_TTL=3600  # 1 hour
   ```

2. **Optimize requests**:

   ```bash
   # Reduce concurrent requests
   MAX_CONCURRENT_REQUESTS=5
   
   # Use compression
   ENABLE_COMPRESSION=true
   ```
### Memory Usage

**Problem**: High memory consumption

**Solution**:

```bash
**Solution**:

```bash

# Limit cache size in .env:

MAX_CACHE_SIZE=100  # MB

# Reduce batch size for large operations:

BATCH_SIZE=10

```

## Common Error Messages
```

## Common Error Messages

### `ModuleNotFoundError: No module named 'fastapi'`

**Solution**: `pip install fastapi uvicorn`

### `requests.exceptions.ConnectionError`

**Solution**: Check internet connection and Canvas URL

### `TypeError: 'NoneType' object is not subscriptable`

**Solution**: Check .env file configuration and Canvas credentials

### `JSON decode error`

**Solution**: Canvas may be returning HTML error page - check credentials and URL

### `AttributeError: 'str' object has no attribute 'json'`

**Solution**: Update requests library: `pip install --upgrade requests`

## Getting Help

### Debug Mode

Enable debug mode for detailed error information:

```bash
# Add to .env file:
DEBUG=true
LOG_LEVEL=DEBUG

# Run with verbose output:
python app.py --verbose
```

### Log Files

Check log files for error details:

```bash
# Default log location
tail -f logs/canvas_mcp.log

# Or enable console logging:
LOG_TO_CONSOLE=true
```

### Creating an Issue

When creating a GitHub issue, please include:

1. **System Information**:

   ```bash
   python --version
   pip list | grep -E "(fastapi|requests|beautifulsoup4)"
   ```

2. **Error Details**:
   - Full error message
   - Stack trace
   - Steps to reproduce

3. **Configuration** (remove sensitive data):

   ```bash
   # .env file contents (anonymized)
   CANVAS_URL=https://SCHOOL.instructure.com
   CANVAS_USERNAME=REDACTED
   CANVAS_PASSWORD=REDACTED
   ```

4. **Canvas Environment**:
   - Institution name (if comfortable sharing)
   - Canvas version (if known)
   - Any special authentication requirements
### Community Support

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/a-ariff/canvas-student-mcp-server/issues)
- **Discussions**: [Ask questions and share tips](https://github.com/a-ariff/canvas-student-mcp-server/discussions)
- **Discord**: [Join the MCP community](https://discord.gg/modelcontextprotocol)
### Professional Support

For institutional deployments or enterprise support:

- Contact your IT department first
- Consider Canvas-provided API solutions
- Ensure compliance with institutional policies
## Prevention Tips

### Best Practices

1. **Use Virtual Environments**:

   ```bash
   python -m venv canvas_mcp_env
   source canvas_mcp_env/bin/activate
   ```

2. **Keep Dependencies Updated**:

   ```bash
   pip install --upgrade -r requirements.txt
   ```

3. **Monitor Rate Limits**:

   ```bash
   # Check Canvas API usage
   curl -H "Authorization: Bearer TOKEN" \
        https://your-school.instructure.com/api/v1/users/self
   ```

4. **Regular Testing**:

   ```bash
   # Test basic functionality
   python -c "import requests; print(requests.get('https://your-school.instructure.com').status_code)"
   ```

5. **Backup Configuration**:

   ```bash
   # Keep a copy of working .env file
   cp .env .env.backup
   ```
### Monitoring Health

Set up basic monitoring:

```bash
# Add to crontab for health checks
*/5 * * * * curl -f http://localhost:8000/health || echo "Canvas MCP Server down" | mail -s "Alert" admin@example.com
```

---

## Quick Fixes Checklist

When something goes wrong, try these in order:

1. ☐ Check server is running: `curl http://localhost:8000/health`
2. ☐ Verify Canvas credentials work in web browser
3. ☐ Test Canvas URL accessibility: `curl -I https://your-school.instructure.com`
4. ☐ Check .env file format and values
5. ☐ Restart the MCP server: `python app.py`
6. ☐ Check Python version: `python --version` (needs 3.9+)
7. ☐ Update dependencies: `pip install --upgrade -r requirements.txt`
8. ☐ Check logs: `tail -f logs/canvas_mcp.log`
9. ☐ Try debug mode: Set `DEBUG=true` in .env
10. ☐ Clear cache: Delete `cache/` directory if it exists
If none of these work, create a GitHub issue with details!

---

*This troubleshooting guide is maintained by the community. If you find a solution to a problem not listed here, please contribute by opening a pull request.*
