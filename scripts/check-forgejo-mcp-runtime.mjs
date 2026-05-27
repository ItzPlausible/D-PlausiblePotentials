import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const expectedTools = new Set([
  "forgejo_version",
  "forgejo_whoami",
  "forgejo_search_repos",
  "forgejo_list_my_repos",
  "forgejo_list_org_repos",
  "forgejo_get_repo",
  "forgejo_list_branches",
  "forgejo_get_file",
]);

const client = new Client({
  name: "ppc-forgejo-mcp-check",
  version: "0.1.0",
});

const transport = new StdioClientTransport({
  command: "node",
  args: ["mcp/forgejo/server.mjs"],
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

  console.log(`Forgejo MCP runtime check passed (${tools.length} tools listed).`);
} finally {
  await client.close();
}
