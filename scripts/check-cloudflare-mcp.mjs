import { readFileSync } from "node:fs";

const source = readFileSync("mcp/cloudflare/server.mjs", "utf8");

const requiredTools = [
  "cloudflare_verify_token",
  "cloudflare_list_accounts",
  "cloudflare_list_workers",
  "cloudflare_get_worker",
  "cloudflare_wrangler",
];

const errors = [];

for (const tool of requiredTools) {
  if (!source.includes(`"${tool}"`)) {
    errors.push(`Cloudflare MCP server is missing tool: ${tool}`);
  }
}

for (const required of [
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "StdioServerTransport",
  "assertWranglerArgs",
  "assertSafeWorkdir",
]) {
  if (!source.includes(required)) {
    errors.push(`Cloudflare MCP server is missing required guard/config: ${required}`);
  }
}

for (const forbidden of ["PASTE_TOKEN", "sk-", "api_token_here"]) {
  if (source.includes(forbidden)) {
    errors.push(`Cloudflare MCP server contains forbidden token placeholder: ${forbidden}`);
  }
}

if (errors.length > 0) {
  console.error("Cloudflare MCP check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Cloudflare MCP check passed (${requiredTools.length} tools registered).`);
