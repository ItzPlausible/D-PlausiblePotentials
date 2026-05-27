# Forgejo MCP Server

This is PPC's Forgejo MCP integration for the full Forgejo instance at
`https://git.c3-voice.org`.

It exposes read-oriented Forgejo tools over stdio so Cursor or another MCP host
can access the Forgejo source-of-truth without committing tokens to git or
depending on local repo files.

## Tools

| Tool | Purpose |
| --- | --- |
| `forgejo_version` | Check Forgejo API reachability and version. |
| `forgejo_whoami` | Verify the authenticated user for `FORGEJO_TOKEN`. |
| `forgejo_list_instance_repos` | List repositories visible across the Forgejo instance. |
| `forgejo_search_repos` | Search repositories visible to the token. |
| `forgejo_list_my_repos` | List repositories visible to the authenticated user. |
| `forgejo_list_org_repos` | List repositories for an organization. |
| `forgejo_get_repo` | Fetch repository metadata. |
| `forgejo_list_branches` | List repository branches. |
| `forgejo_get_file` | Read a text file from a repository at a branch, tag, or commit. |

## Required managed secrets

Configure these in the MCP host, Cursor environment, or cloud-agent secret
manager:

```bash
FORGEJO_URL=https://git.c3-voice.org
FORGEJO_TOKEN=<managed-secret>
FORGEJO_OWNER=<default-owner-or-org>
```

Do not commit Forgejo tokens. Do not store source-of-truth credentials in
GitHub-tracked files.

If `C3-Cursor` is the Forgejo token name, bind that token to the managed
environment variable `FORGEJO_TOKEN` in the MCP host. The MCP server expects the
environment variable name, not the token's display name.

## Run locally for MCP hosts

```bash
npm run mcp:forgejo
```

The server uses stdio, so it waits for an MCP client to connect.

## Cursor MCP configuration example

Use [`cursor-mcp.example.json`](cursor-mcp.example.json) as the starting point.
It references `${FORGEJO_TOKEN}` so the MCP host can inject the managed secret
without storing the token in git.

Equivalent inline example:

```json
{
  "mcpServers": {
    "ppc-forgejo": {
      "command": "node",
      "args": ["mcp/forgejo/server.mjs"],
      "env": {
        "FORGEJO_URL": "https://git.c3-voice.org",
        "FORGEJO_OWNER": "Kosmo",
        "FORGEJO_TOKEN": "${FORGEJO_TOKEN}"
      }
    }
  }
}
```

If the MCP host supports secret interpolation, bind `FORGEJO_TOKEN` there rather
than placing it in this file.

## Important distinction

A GitHub-tracked `.env` file is repository content, not a safe managed secret
location. PPC's intended workflow is:

1. Create the Forgejo token in Forgejo. Example display name: `C3-Cursor`.
2. Store that token in the MCP host or cloud-agent secret manager as
   `FORGEJO_TOKEN`.
3. Configure this MCP server to read `FORGEJO_TOKEN` from the host environment.
4. Use the MCP tools for source-of-truth access.

## Current scope

This server is intentionally read-oriented first and instance-aware. It can
enumerate repositories visible to the token across `git.c3-voice.org`, while git
remotes remain repo-specific by design. Add write tools only after PPC defines
clear approval rules for mirroring, branch creation, issue updates, and release
tagging.
