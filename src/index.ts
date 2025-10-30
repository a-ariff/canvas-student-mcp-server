/**
 * Local Smithery entry that bridges to the remote SSE MCP server with OAuth 2.1.
 *
 * Smithery’s GitHub publishing requires a buildable TypeScript entry.
 * This file simply spawns the official OAuth2 MCP client to connect
 * to the hosted SSE endpoint and forwards stdio for Claude/Desktop.
 */

import { spawn } from "node:child_process";

const REMOTE_SSE_URL =
  process.env.MCP_REMOTE_URL || "https://canvas-mcp-sse.ariff.dev/sse";

const args = [
  "-y",
  "@modelcontextprotocol/client-oauth2",
  REMOTE_SSE_URL,
];

const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(npxCmd, args, {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (err) => {
  console.error("Failed to launch OAuth2 MCP client:", err);
  process.exit(1);
});
