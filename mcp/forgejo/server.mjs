#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const DEFAULT_FORGEJO_URL = "https://git.c3-voice.org";

function config() {
  return {
    baseUrl: (process.env.FORGEJO_URL || DEFAULT_FORGEJO_URL).replace(/\/+$/, ""),
    token: process.env.FORGEJO_TOKEN || "",
    defaultOwner: process.env.FORGEJO_OWNER || "",
  };
}

function text(data) {
  return {
    content: [
      {
        type: "text",
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

function requireToken() {
  const { token } = config();
  if (!token) {
    throw new Error(
      "FORGEJO_TOKEN is not configured. Provide it through managed environment secrets or an MCP host secret.",
    );
  }
  return token;
}

async function forgejoRequest(path, options = {}) {
  const { baseUrl, token } = config();
  const headers = {
    Accept: "application/json",
    "User-Agent": "ppc-forgejo-mcp/0.1.0",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  const responseText = await response.text();
  let body = responseText;

  if (responseText) {
    try {
      body = JSON.parse(responseText);
    } catch {
      body = responseText;
    }
  }

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? body.message
        : responseText || response.statusText;
    throw new Error(`Forgejo API ${response.status}: ${message}`);
  }

  return body;
}

function urlQuery(params) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

function encodePathSegment(value) {
  return encodeURIComponent(value);
}

function encodeFilePath(filePath) {
  return filePath
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function decodeContent(content, encoding) {
  if (encoding !== "base64") {
    return content;
  }

  return Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8");
}

const server = new McpServer({
  name: "ppc-forgejo",
  version: "0.1.0",
});

server.registerTool(
  "forgejo_version",
  {
    title: "Get Forgejo version",
    description: "Check that the Forgejo API is reachable and return its version metadata.",
  },
  async () => {
    return text(await forgejoRequest("/api/v1/version"));
  },
);

server.registerTool(
  "forgejo_whoami",
  {
    title: "Get authenticated Forgejo user",
    description: "Return the Forgejo user associated with FORGEJO_TOKEN.",
  },
  async () => {
    requireToken();
    const user = await forgejoRequest("/api/v1/user");
    return text({
      id: user.id,
      login: user.login,
      full_name: user.full_name,
      email: user.email ? "[redacted]" : "",
      is_admin: user.is_admin,
    });
  },
);

server.registerTool(
  "forgejo_search_repos",
  {
    title: "Search Forgejo repositories",
    description: "Search repositories visible to the configured Forgejo token.",
    inputSchema: {
      query: z.string().default(""),
      owner: z.string().optional(),
      limit: z.number().int().min(1).max(50).default(10),
    },
  },
  async ({ query, owner, limit }) => {
    requireToken();
    const result = await forgejoRequest(
      `/api/v1/repos/search${urlQuery({ q: query, owner, limit })}`,
    );
    return text(
      (result.data || []).map((repo) => ({
        full_name: repo.full_name,
        clone_url: repo.clone_url,
        ssh_url: repo.ssh_url,
        private: repo.private,
        default_branch: repo.default_branch,
        updated_at: repo.updated_at,
        description: repo.description,
      })),
    );
  },
);

server.registerTool(
  "forgejo_list_my_repos",
  {
    title: "List authenticated user repositories",
    description: "List repositories available to the authenticated Forgejo user.",
    inputSchema: {
      limit: z.number().int().min(1).max(50).default(20),
      page: z.number().int().min(1).default(1),
    },
  },
  async ({ limit, page }) => {
    requireToken();
    const repos = await forgejoRequest(`/api/v1/user/repos${urlQuery({ limit, page })}`);
    return text(
      repos.map((repo) => ({
        full_name: repo.full_name,
        clone_url: repo.clone_url,
        private: repo.private,
        default_branch: repo.default_branch,
        updated_at: repo.updated_at,
        description: repo.description,
      })),
    );
  },
);

server.registerTool(
  "forgejo_list_org_repos",
  {
    title: "List Forgejo organization repositories",
    description: "List repositories for an organization visible to the configured token.",
    inputSchema: {
      org: z.string().optional(),
      limit: z.number().int().min(1).max(50).default(20),
      page: z.number().int().min(1).default(1),
    },
  },
  async ({ org, limit, page }) => {
    requireToken();
    const resolvedOrg = org || config().defaultOwner;
    if (!resolvedOrg) {
      throw new Error("Provide org or configure FORGEJO_OWNER.");
    }

    const repos = await forgejoRequest(
      `/api/v1/orgs/${encodePathSegment(resolvedOrg)}/repos${urlQuery({ limit, page })}`,
    );
    return text(
      repos.map((repo) => ({
        full_name: repo.full_name,
        clone_url: repo.clone_url,
        private: repo.private,
        default_branch: repo.default_branch,
        updated_at: repo.updated_at,
        description: repo.description,
      })),
    );
  },
);

server.registerTool(
  "forgejo_get_repo",
  {
    title: "Get Forgejo repository metadata",
    description: "Fetch metadata for a Forgejo repository.",
    inputSchema: {
      owner: z.string().optional(),
      repo: z.string(),
    },
  },
  async ({ owner, repo }) => {
    requireToken();
    const resolvedOwner = owner || config().defaultOwner;
    if (!resolvedOwner) {
      throw new Error("Provide owner or configure FORGEJO_OWNER.");
    }

    const data = await forgejoRequest(
      `/api/v1/repos/${encodePathSegment(resolvedOwner)}/${encodePathSegment(repo)}`,
    );
    return text({
      full_name: data.full_name,
      clone_url: data.clone_url,
      ssh_url: data.ssh_url,
      private: data.private,
      default_branch: data.default_branch,
      updated_at: data.updated_at,
      description: data.description,
      permissions: data.permissions,
    });
  },
);

server.registerTool(
  "forgejo_list_branches",
  {
    title: "List Forgejo repository branches",
    description: "List branches for a Forgejo repository.",
    inputSchema: {
      owner: z.string().optional(),
      repo: z.string(),
      limit: z.number().int().min(1).max(100).default(50),
      page: z.number().int().min(1).default(1),
    },
  },
  async ({ owner, repo, limit, page }) => {
    requireToken();
    const resolvedOwner = owner || config().defaultOwner;
    if (!resolvedOwner) {
      throw new Error("Provide owner or configure FORGEJO_OWNER.");
    }

    const branches = await forgejoRequest(
      `/api/v1/repos/${encodePathSegment(resolvedOwner)}/${encodePathSegment(repo)}/branches${urlQuery({
        limit,
        page,
      })}`,
    );
    return text(
      branches.map((branch) => ({
        name: branch.name,
        commit_id: branch.commit?.id,
        commit_message: branch.commit?.commit?.message,
      })),
    );
  },
);

server.registerTool(
  "forgejo_get_file",
  {
    title: "Read a file from Forgejo",
    description: "Read a text file from a Forgejo repository at a branch, tag, or commit.",
    inputSchema: {
      owner: z.string().optional(),
      repo: z.string(),
      path: z.string(),
      ref: z.string().optional(),
    },
  },
  async ({ owner, repo, path, ref }) => {
    requireToken();
    const resolvedOwner = owner || config().defaultOwner;
    if (!resolvedOwner) {
      throw new Error("Provide owner or configure FORGEJO_OWNER.");
    }

    const data = await forgejoRequest(
      `/api/v1/repos/${encodePathSegment(resolvedOwner)}/${encodePathSegment(repo)}/contents/${encodeFilePath(
        path,
      )}${urlQuery({ ref })}`,
    );

    if (Array.isArray(data)) {
      return text(
        data.map((item) => ({
          name: item.name,
          path: item.path,
          type: item.type,
        })),
      );
    }

    return text({
      name: data.name,
      path: data.path,
      ref: data.last_commit_sha,
      content: decodeContent(data.content || "", data.encoding),
    });
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
