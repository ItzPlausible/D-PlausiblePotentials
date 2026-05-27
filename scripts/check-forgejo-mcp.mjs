import { readFileSync } from "node:fs";

const source = readFileSync("mcp/forgejo/server.mjs", "utf8");

const requiredTools = [
  "forgejo_version",
  "forgejo_whoami",
  "forgejo_search_repos",
  "forgejo_list_my_repos",
  "forgejo_list_org_repos",
  "forgejo_get_repo",
  "forgejo_list_branches",
  "forgejo_get_file",
];

const errors = [];

for (const tool of requiredTools) {
  if (!source.includes(`"${tool}"`)) {
    errors.push(`Forgejo MCP server is missing tool: ${tool}`);
  }
}

for (const forbidden of ["PASTE_TOKEN", "C3-Cursor"]) {
  if (source.includes(forbidden)) {
    errors.push(`Forgejo MCP server contains forbidden token placeholder: ${forbidden}`);
  }
}

if (!source.includes("StdioServerTransport")) {
  errors.push("Forgejo MCP server must expose a stdio transport.");
}

if (!source.includes("FORGEJO_TOKEN")) {
  errors.push("Forgejo MCP server must read FORGEJO_TOKEN from managed environment.");
}

if (errors.length > 0) {
  console.error("Forgejo MCP check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Forgejo MCP check passed (${requiredTools.length} tools registered).`);
