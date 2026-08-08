#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = resolve(__dirname, "../.output/server/index.mjs");

// Only the Node (nitro node-server) build emits .output/server/index.mjs.
// Other build targets emit elsewhere, so skip silently instead of failing.
if (!existsSync(serverPath)) {
  console.log("ℹ️  .output/server/index.mjs not found — skipping server lifecycle fix");
  process.exit(0);
}

const content = readFileSync(serverPath, "utf-8");

// Check if already fixed
if (content.includes("(async () => {\n  try {\n    await serve({")) {
  console.log("✅ Server lifecycle already fixed");
  process.exit(0);
}

// Fix the serve() call to be awaited
const fixed = content.replace(
  /const nitroApp = useNitroApp\(\);[\s\n]*serve\(\{[\s\n]*(.*?)[\s\n]*\}\);[\s\n]*trapUnhandledErrors\(\);/s,
  (match, serveConfig) => {
    return `const nitroApp = useNitroApp();

(async () => {
  try {
    await serve({
      ${serveConfig.trim()}
    });
  } catch (error) {
    console.error("Server error:", error);
    process.exit(1);
  }
})();

trapUnhandledErrors();`;
  },
);

if (fixed !== content) {
  writeFileSync(serverPath, fixed, "utf-8");
  console.log("✅ Server lifecycle fixed: serve() now properly awaited");
} else {
  console.warn(
    "⚠️  Could not identify server pattern for fixing. Manual inspection may be needed.",
  );
}
