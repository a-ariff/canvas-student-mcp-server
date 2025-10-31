# Skill: Install Memory + Smithery Toolbox (Local)

Use on your workstation to enhance problem solving and inspection.

## Prerequisites
- Node.js >= 18
- Smithery CLI (npx will fetch it)
- Your Smithery API key (treat as secret)

## Commands

### Sequential Thinking server
```bash
npx -y @smithery/cli@latest install \
  @smithery-ai/server-sequential-thinking \
  --client codex \
  --profile sad-bobcat-uolbER \
  --key <YOUR_SMITHERY_KEY>
```

### Smithery Toolbox
```bash
npx -y @smithery/cli@latest install \
  @smithery/toolbox \
  --client codex \
  --key <YOUR_SMITHERY_KEY>
```

## Notes
- These servers aid reasoning and inspection; they do not modify the Canvas MCP server.
- Store keys securely (e.g., 1Password or OS keychain); don’t commit them.
- If behind a proxy, set `HTTPS_PROXY` / `HTTP_PROXY` before running.

## Uninstall
```bash
npx -y @smithery/cli@latest uninstall @smithery-ai/server-sequential-thinking
npx -y @smithery/cli@latest uninstall @smithery/toolbox
```

Last Updated: 2025‑10‑31
