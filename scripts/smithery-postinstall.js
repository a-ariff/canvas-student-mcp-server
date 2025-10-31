const { execSync } = require('node:child_process');
function ensure(mod) {
  try { require.resolve(mod); return true; } catch { return false; }
}
const missing = ["@smithery/sdk", "chalk"].filter(m => !ensure(m));
if (missing.length) {
  try {
    console.log("[smithery-postinstall] Installing:", missing.join(", "));
    execSync(`npm install ${missing.join(' ')} --no-save`, { stdio: 'inherit' });
  } catch (e) {
    console.warn("[smithery-postinstall] best-effort install failed:", e.message);
  }
}
