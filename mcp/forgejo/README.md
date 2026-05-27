# Forgejo MCP Server

This is PPC's Forgejo MCP integration for `https://git.c3-voice.org`.

It exposes read-oriented Forgejo tools over stdio so Cursor or another MCP host
can access the Forgejo source-of-truth without committing tokens to git or
depending on local repo files.

## Tools

| Tool | Purpose |
| --- | --- |
| `forgejo_version` | Check Forgejo API reachability and version. |
| `forgejo_whoami` | Verify the authenticated user for `FORGEJO_TOKEN`. |
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

## Run locally for MCP hosts

```bash
npm run mcp:forgejo
```

The server uses stdio, so it waits for an MCP client to connect.

## Cursor MCP configuration example

Add this kind of entry to the MCP host configuration, with the token supplied by
the host's managed secret mechanism:

```json
{
  "mcpServers": {
    "ppc-forgejo": {
      "command": "node",
      "args": ["mcp/forgejo/server.mjs"],
      "env": {
        "FORGEJO_URL": "https://git.c3-voice.org",
        "FORGEJO_OWNER": "Kosmo"
      }
    }
  }
}
```

If the MCP host supports secret interpolation, bind `FORGEJO_TOKEN` there rather
than placing it in this file.

## Current scope

This server is intentionally read-oriented first. Add write tools only after PPC
defines clear approval rules for mirroring, branch creation, issue updates, and
release tagging.
