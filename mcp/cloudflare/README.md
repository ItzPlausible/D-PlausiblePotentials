# Cloudflare MCP Server

This is PPC's Cloudflare MCP integration for Workers deployment and account
inspection.

It exposes a narrow stdio MCP surface that reads Cloudflare credentials from the
MCP host environment. It does **not** store Cloudflare tokens in the repository.

## Tools

| Tool | Purpose |
| --- | --- |
| `cloudflare_verify_token` | Verify that the configured API token is valid. |
| `cloudflare_list_accounts` | List Cloudflare accounts visible to the token. |
| `cloudflare_list_workers` | List Workers scripts for an account. |
| `cloudflare_get_worker` | Fetch Worker metadata/settings. |
| `cloudflare_wrangler` | Run a guarded Wrangler command in an allowed repo path. |

## Required managed secrets

Configure these in the MCP host, Cursor environment, or cloud-agent secret
manager:

```bash
CLOUDFLARE_API_TOKEN=<managed-secret>
CLOUDFLARE_ACCOUNT_ID=<account-id>
```

Aliases are also accepted:

```bash
CF_API_TOKEN=<managed-secret>
CF_ACCOUNT_ID=<account-id>
```

Do not commit Cloudflare tokens.

## Run locally for MCP hosts

```bash
npm run mcp:cloudflare
```

The server uses stdio, so it waits for an MCP client to connect.

## Cursor MCP configuration example

Use [`cursor-mcp.example.json`](cursor-mcp.example.json) as the starting point.
It references `${CLOUDFLARE_API_TOKEN}` so the MCP host can inject the managed
secret without storing the token in git.

```json
{
  "mcpServers": {
    "ppc-cloudflare": {
      "command": "node",
      "args": ["mcp/cloudflare/server.mjs"],
      "env": {
        "CLOUDFLARE_ACCOUNT_ID": "${CLOUDFLARE_ACCOUNT_ID}",
        "CLOUDFLARE_API_TOKEN": "${CLOUDFLARE_API_TOKEN}"
      }
    }
  }
}
```

## Guardrails

The `cloudflare_wrangler` tool:

- only runs `npx wrangler ...`;
- allows only selected Wrangler commands: `deploy`, `check`, `types`, `whoami`,
  and `versions`;
- requires an explicit `cwd`;
- limits `cwd` to the current workspace and `/tmp/ppc-preflight-command` by
  default;
- redacts the Cloudflare token from output;
- does not allow arbitrary shell commands.

## Intended deployment usage

After Forgejo source branches are merged, deploy from the checked-out source
repo paths:

```json
{
  "cwd": "/tmp/ppc-preflight-command/c3-alliance__command-c3",
  "args": ["deploy", "--keep-vars"]
}
```

```json
{
  "cwd": "/tmp/ppc-preflight-command/kosmo__command-center",
  "args": ["deploy", "--keep-vars"]
}
```

Use `["deploy", "--dry-run"]` first when validating a new environment.
