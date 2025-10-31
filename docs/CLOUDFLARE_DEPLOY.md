# Cloudflare Auto‑Deploy (GitHub Actions)

This repo deploys the Workers on every push to `main` using GitHub Actions.

## Secrets to Add (Repository → Settings → Secrets and variables → Actions)

- `CLOUDFLARE_ACCOUNT_ID` – Your Cloudflare Account ID
- `CLOUDFLARE_API_TOKEN` – API token with `Workers Scripts:Edit`, `Workers KV:Edit` (if used), and `Pages:Edit` if needed

## Workflow

- `.github/workflows/cf-deploy.yml`
- Deploys:
  - `packages/remote-mcp-server-authless` (MCP SSE server)
  - `packages/cloudflare-canvas-api` (optional proxy, best effort)

## Local Manual Deploy (optional)

```bash
cd packages/remote-mcp-server-authless
npm ci
npx wrangler whoami
npx wrangler deploy
```

## Verify

```bash
curl -s https://canvas-mcp-sse.ariff.dev/.well-known/mcp-config | jq
curl -s https://canvas-mcp-sse.ariff.dev/.well-known/oauth-authorization-server | jq
curl -i -X OPTIONS https://canvas-mcp-sse.ariff.dev/sse -H 'Origin: https://smithery.ai' -H 'Access-Control-Request-Method: GET'
```

If you need help generating the API token, open Cloudflare dashboard → My Profile → API Tokens → Create → “Edit Cloudflare Workers”.

