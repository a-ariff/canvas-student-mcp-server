# Troubleshooting Guide

Common issues and solutions for the Canvas API Proxy.

## Table of Contents

- [Authentication Issues](#authentication-issues)
- [Rate Limiting](#rate-limiting)
- [Caching Problems](#caching-problems)
- [CORS Errors](#cors-errors)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)
- [Canvas API Errors](#canvas-api-errors)

---

## Authentication Issues

### Error: "Invalid Canvas API token"

**Symptoms**: 401 Unauthorized error when calling `/auth` endpoint

**Causes**:
- Canvas API token has expired
- Token was copied incorrectly (whitespace, missing characters)
- Token doesn't have sufficient permissions

**Solutions**:

1. **Verify your token hasn't expired**:
   - Log into Canvas → Account → Settings
   - Check "Approved Integrations"
   - Look for your token's expiration date
   - Generate new token if expired

2. **Re-copy your token carefully**:
   ```bash
   # Make sure there's no whitespace or line breaks
   curl -X POST https://canvas-mcp.ariff.dev/auth \
     -H "Content-Type: application/json" \
     -d '{
       "canvasUrl": "https://learn.mywhitecliffe.com",
       "apiKey": "19765~YourTokenHereWithNoSpaces",
       "institutionName": "Your School"
     }'
   ```

3. **Check token permissions**:
   - Token must have read access to courses, assignments, calendar
   - Some institutions restrict token scopes
   - Contact Canvas admin if permissions are insufficient

### Error: "User ID not found"

**Symptoms**: 404 error when using saved user ID

**Causes**:
- User session expired (24 hour limit)
- User ID was copied incorrectly
- Cache was cleared

**Solutions**:

1. **Re-authenticate**:
   ```bash
   # Get a fresh user ID
   curl -X POST https://canvas-mcp.ariff.dev/auth \
     -H "Content-Type: application/json" \
     -d '{"canvasUrl": "...","apiKey": "..."}'
   ```

2. **Save user ID properly**:
   ```javascript
   // Store in localStorage for web apps
   localStorage.setItem('canvasUserId', userId);

   // Or in environment variable for CLI tools
   export CANVAS_USER_ID="user_abc123xyz"
   ```

### Error: "Canvas URL not accessible"

**Symptoms**: 502 Bad Gateway or timeout errors

**Causes**:
- Canvas instance URL is incorrect
- Canvas is behind a firewall
- Canvas is experiencing downtime

**Solutions**:

1. **Verify Canvas URL format**:
   ```bash
   # Correct formats:
   https://canvas.instructure.com
   https://yourschool.instructure.com
   https://learn.mywhitecliffe.com

   # Incorrect (will fail):
   canvas.instructure.com  # Missing https://
   https://canvas.instructure.com/  # Trailing slash
   ```

2. **Test Canvas API directly**:
   ```bash
   curl https://learn.mywhitecliffe.com/api/v1/courses \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Check Canvas status**:
   - Visit status.instructure.com
   - Check your institution's Canvas status page

---

## Rate Limiting

### Error: "Rate limit exceeded"

**Symptoms**: 429 Too Many Requests error

**Causes**:
- Exceeded 100 requests per minute per user
- Multiple clients using same user ID
- Burst of requests without throttling

**Solutions**:

1. **Implement request throttling**:
   ```javascript
   // JavaScript example
   const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

   async function makeRequestWithThrottle(endpoint) {
     try {
       const response = await fetch(endpoint);
       return await response.json();
     } catch (error) {
       if (error.status === 429) {
         console.log('Rate limited, waiting 60 seconds...');
         await delay(60000);
         return makeRequestWithThrottle(endpoint); // Retry
       }
       throw error;
     }
   }
   ```

2. **Check rate limit headers**:
   ```bash
   curl -I https://canvas-mcp.ariff.dev/courses/your_user_id

   # Look for:
   # X-RateLimit-Limit: 100
   # X-RateLimit-Remaining: 45
   # X-RateLimit-Reset: 1696161600
   ```

3. **Spread requests over time**:
   ```bash
   # Instead of this:
   for course in $(seq 1 50); do
     curl https://canvas-mcp.ariff.dev/courses/$USER_ID
   done

   # Do this:
   for course in $(seq 1 50); do
     curl https://canvas-mcp.ariff.dev/courses/$USER_ID
     sleep 1  # Wait 1 second between requests
   done
   ```

4. **Increase rate limit (admin only)**:
   ```toml
   # Edit wrangler.toml
   [vars]
   MAX_REQUESTS_PER_MINUTE = 200  # Increase limit
   ```

---

## Caching Problems

### Issue: Stale data being returned

**Symptoms**: Updates in Canvas not reflected in API responses

**Causes**:
- Cache TTL too long (default 5 minutes)
- Recent Canvas changes not yet propagated
- Cache headers not being checked

**Solutions**:

1. **Check cache status**:
   ```bash
   curl -I https://canvas-mcp.ariff.dev/courses/your_user_id

   # Look for:
   # X-Cache: HIT  (data from cache)
   # X-Cache: MISS (fresh data from Canvas)
   ```

2. **Wait for cache expiration**:
   - Default TTL: 300 seconds (5 minutes)
   - Cache automatically refreshes after expiration

3. **Reduce cache TTL** (admin only):
   ```toml
   # Edit wrangler.toml
   [vars]
   CACHE_TTL_SECONDS = 60  # Reduce to 1 minute
   ```

4. **Disable caching temporarily** (local development):
   ```bash
   # In wrangler.toml
   [vars]
   CACHE_TTL_SECONDS = 0  # Disable caching
   ```

### Issue: Cache not working

**Symptoms**: All requests showing `X-Cache: MISS`

**Causes**:
- KV namespace not properly configured
- Cache TTL set to 0
- Each request has unique parameters

**Solutions**:

1. **Verify KV namespaces**:
   ```bash
   wrangler kv:namespace list

   # Should show:
   # - CACHE_KV
   # - RATE_LIMIT_KV
   ```

2. **Check wrangler.toml configuration**:
   ```toml
   [[kv_namespaces]]
   binding = "CACHE_KV"
   id = "your_namespace_id_here"  # Must not be empty
   ```

3. **Test cache manually**:
   ```bash
   # First request (should be MISS)
   curl -I https://canvas-mcp.ariff.dev/courses/your_user_id

   # Second request within 5 minutes (should be HIT)
   curl -I https://canvas-mcp.ariff.dev/courses/your_user_id
   ```

---

## CORS Errors

### Error: "Access-Control-Allow-Origin"

**Symptoms**: CORS error in browser console

**Causes**:
- Frontend domain not in allowed origins list
- Preflight OPTIONS request failing
- Missing CORS headers

**Solutions**:

1. **Check current CORS configuration**:
   ```bash
   curl -H "Origin: https://yourapp.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://canvas-mcp.ariff.dev/health
   ```

2. **Configure allowed origins** (admin only):
   ```toml
   # wrangler.toml
   [vars]
   CORS_ORIGINS = "https://yourapp.com,https://app.example.com"
   ```

3. **Allow all origins** (development only):
   ```toml
   # wrangler.toml
   [vars]
   CORS_ORIGINS = "*"  # ⚠️ Not recommended for production
   ```

4. **Use a proxy for local development**:
   ```bash
   # Use a local proxy to bypass CORS
   npm install -g local-cors-proxy
   lcp --proxyUrl https://canvas-mcp.ariff.dev

   # Then use http://localhost:8010/proxy in your app
   ```

---

## Deployment Issues

### Error: "wrangler command not found"

**Solutions**:

```bash
# Install wrangler globally
npm install -g wrangler

# Or use npx
npx wrangler deploy
```

### Error: "KV namespace not found"

**Symptoms**: Worker crashes immediately after deployment

**Solutions**:

1. **Create KV namespaces**:
   ```bash
   wrangler kv:namespace create "CACHE_KV"
   wrangler kv:namespace create "CACHE_KV" --preview
   wrangler kv:namespace create "RATE_LIMIT_KV"
   wrangler kv:namespace create "RATE_LIMIT_KV" --preview
   ```

2. **Update wrangler.toml with namespace IDs**:
   ```toml
   [[kv_namespaces]]
   binding = "CACHE_KV"
   id = "abc123..."  # From previous command output
   preview_id = "def456..."

   [[kv_namespaces]]
   binding = "RATE_LIMIT_KV"
   id = "ghi789..."
   preview_id = "jkl012..."
   ```

### Error: "Missing required secrets"

**Symptoms**: Worker deployed but returns 500 errors

**Solutions**:

```bash
# Set all required secrets
wrangler secret put ENCRYPTION_KEY
# Enter: Strong random string (e.g., openssl rand -hex 32)

wrangler secret put ADMIN_API_KEY
# Enter: Strong random string for admin access
```

### Error: "Route pattern already exists"

**Solutions**:

1. **Check existing routes**:
   ```bash
   wrangler routes list
   ```

2. **Delete conflicting route**:
   ```bash
   wrangler route delete <route-id>
   ```

3. **Update wrangler.toml with unique pattern**:
   ```toml
   [route]
   pattern = "canvas-api-v2.yourdomain.com/*"  # Different subdomain
   zone_name = "yourdomain.com"
   ```

---

## Performance Issues

### Issue: Slow response times

**Symptoms**: Requests taking >2 seconds

**Causes**:
- Canvas API is slow
- Cold start (worker not recently used)
- Large response payload
- Network latency

**Solutions**:

1. **Check Canvas API response time**:
   ```bash
   time curl https://learn.mywhitecliffe.com/api/v1/courses \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Use pagination for large datasets**:
   ```bash
   # Instead of fetching all courses:
   curl https://canvas-mcp.ariff.dev/courses/user_id

   # Fetch in smaller pages:
   curl "https://canvas-mcp.ariff.dev/courses/user_id?per_page=10&page=1"
   ```

3. **Monitor cache hit rate**:
   ```bash
   # Check if caching is working
   for i in {1..10}; do
     curl -I https://canvas-mcp.ariff.dev/courses/user_id | grep X-Cache
   done

   # Should see mostly "HIT" after first request
   ```

4. **Warm up worker** (keep it active):
   ```bash
   # Ping health endpoint every 5 minutes
   */5 * * * * curl https://canvas-mcp.ariff.dev/health
   ```

### Issue: High latency from specific regions

**Solutions**:

1. **Verify Cloudflare edge deployment**:
   - Workers should deploy to 300+ locations
   - Check https://www.cloudflare.com/network/

2. **Test from different locations**:
   ```bash
   # Use online tools like:
   # - uptrends.com/tools/uptime
   # - pingdom.com/product/page-speed/
   ```

3. **Enable Argo Smart Routing** (Cloudflare dashboard):
   - Optimizes routing between edge and origin
   - Reduces latency by 30% on average

---

## Canvas API Errors

### Error: Canvas returns 401/403

**Symptoms**: Proxy works but Canvas rejects requests

**Causes**:
- Canvas API token expired
- Insufficient Canvas permissions
- Canvas account locked/disabled

**Solutions**:

1. **Test Canvas API directly**:
   ```bash
   curl -v https://learn.mywhitecliffe.com/api/v1/courses \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Check token permissions in Canvas**:
   - Log into Canvas
   - Account → Settings → Approved Integrations
   - View token details
   - Regenerate if necessary

3. **Contact Canvas administrator**:
   - Your account may need additional API permissions
   - Some institutions restrict API access

### Error: Canvas returns 404

**Symptoms**: Specific endpoint returns 404

**Causes**:
- Endpoint not available at your Canvas instance
- Course/assignment ID doesn't exist
- Incorrect endpoint path

**Solutions**:

1. **Verify endpoint exists**:
   ```bash
   # Check Canvas API documentation
   # https://canvas.instructure.com/doc/api/
   ```

2. **Test with known good IDs**:
   ```bash
   # Get your course list first
   curl https://canvas-mcp.ariff.dev/courses/your_user_id

   # Then use a real course ID
   curl "https://canvas-mcp.ariff.dev/assignments/your_user_id?course_id=REAL_ID"
   ```

### Error: Canvas returns 503

**Symptoms**: Canvas unavailable errors

**Solutions**:

1. **Check Canvas status**:
   - Visit https://status.instructure.com
   - Check your institution's status page

2. **Implement retry logic**:
   ```javascript
   async function fetchWithRetry(url, retries = 3) {
     for (let i = 0; i < retries; i++) {
       try {
         const response = await fetch(url);
         if (response.ok) return response;
         if (response.status === 503 && i < retries - 1) {
           await new Promise(r => setTimeout(r, 5000 * (i + 1)));
           continue;
         }
         throw new Error(`HTTP ${response.status}`);
       } catch (error) {
         if (i === retries - 1) throw error;
       }
     }
   }
   ```

---

## Getting More Help

### Enable Debug Logging

For local development:

```bash
# In wrangler.toml
[vars]
DEBUG = "true"
LOG_LEVEL = "debug"

# Then check logs
wrangler tail
```

### Check Worker Logs

```bash
# Stream live logs
wrangler tail

# Filter for errors only
wrangler tail --status error
```

### Contact Support

If you're still experiencing issues:

1. **Check GitHub Issues**: https://github.com/a-ariff/canvas-student-mcp-server/issues
2. **Create new issue** with:
   - Error message and full response
   - Steps to reproduce
   - curl command that fails
   - Expected vs actual behavior
3. **Include logs** (with sensitive data removed):
   ```bash
   wrangler tail > debug.log
   # Remove tokens/keys before sharing
   ```

### Common Gotchas

1. **API Key Formatting**:
   - Must be complete token from Canvas (starts with numbers~)
   - No spaces or line breaks
   - Copy from Canvas carefully

2. **URL Formatting**:
   - Include `https://`
   - No trailing slashes
   - Use exact Canvas URL from your institution

3. **User ID Persistence**:
   - User IDs expire after 24 hours
   - Store them but be ready to re-authenticate
   - Don't hardcode user IDs

4. **Cloudflare Limits**:
   - Workers have 50ms CPU time limit
   - KV has eventual consistency (writes may take seconds)
   - Free tier: 100,000 requests/day

5. **Canvas Rate Limits**:
   - Canvas itself has rate limits (separate from proxy)
   - Default: 3000 requests/hour per token
   - Proxy rate limit is additional protection

---

**Still need help?** Open an issue on GitHub with detailed information about your problem.
