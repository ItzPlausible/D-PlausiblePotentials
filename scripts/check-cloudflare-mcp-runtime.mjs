import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const expectedTools = new Set([
  "cloudflare_verify_token",
  "cloudflare_list_accounts",
  "cloudflare_list_workers",
  "cloudflare_get_worker",
  "cloudflare_wrangler",
]);

const client = new Client({
  name: "ppc-cloudflare-mcp-check",
  version: "0.1.0",
});

const transport = new StdioClientTransport({
  command: "node",
  args: ["mcp/cloudflare/server.mjs"],
  cwd: process.cwd(),
  stderr: "pipe",
});

try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  const names = new Set(tools.map((tool) => tool.name));
  const missing = [...expectedTools].filter((tool) => !names.has(tool));

  if (missing.length > 0) {
    throw new Error(`Missing MCP tools: ${missing.join(", ")}`);
  }

  console.log(`Cloudflare MCP runtime check passed (${tools.length} tools listed).`);
} finally {
  await client.close();
}
