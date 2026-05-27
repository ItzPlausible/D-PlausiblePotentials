#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const CLOUDFLARE_API = "https://api.cloudflare.com/client/v4";
const WORKSPACE_ROOT = realpathSync(process.cwd());
const DEFAULT_ALLOWED_ROOTS = [
  WORKSPACE_ROOT,
  "/tmp/ppc-preflight-command",
].filter(existsSync).map((entry) => realpathSync(entry));

function config() {
  return {
    token: process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || "",
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || "",
    allowedRoots: (process.env.CLOUDFLARE_MCP_ALLOWED_ROOTS || "")
      .split(":")
      .filter(Boolean)
      .map((entry) => realpathSync(entry))
      .concat(DEFAULT_ALLOWED_ROOTS),
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
      "CLOUDFLARE_API_TOKEN is not configured. Provide it through managed environment secrets or an MCP host secret.",
    );
  }
  return token;
}

function requireAccountId(accountId) {
  const resolved = accountId || config().accountId;
  if (!resolved) {
    throw new Error("Provide account_id or configure CLOUDFLARE_ACCOUNT_ID.");
  }
  return resolved;
}

async function cloudflareRequest(apiPath, options = {}) {
  const token = requireToken();
  const response = await fetch(`${CLOUDFLARE_API}${apiPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const bodyText = await response.text();
  let body = bodyText;
  if (bodyText) {
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = bodyText;
    }
  }

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null
        ? JSON.stringify(body)
        : bodyText || response.statusText;
    throw new Error(`Cloudflare API ${response.status}: ${message}`);
  }

  return body;
}

function assertSafeWorkdir(cwd) {
  if (!cwd) throw new Error("cwd is required.");
  if (!existsSync(cwd)) throw new Error(`cwd does not exist: ${cwd}`);

  const resolved = realpathSync(cwd);
  const allowed = config().allowedRoots.some((root) => resolved === root || resolved.startsWith(`${root}${path.sep}`));
  if (!allowed) {
    throw new Error(`cwd is outside allowed roots: ${resolved}`);
  }
  return resolved;
}

function assertWranglerArgs(args) {
  if (!Array.isArray(args) || args.length === 0) {
    throw new Error("args must be a non-empty Wrangler argument array.");
  }

  const command = args[0];
  const allowedCommands = new Set(["deploy", "check", "types", "whoami", "versions", "tail"]);
  if (!allowedCommands.has(command)) {
    throw new Error(`Wrangler command is not allowed: ${command}`);
  }

  for (const arg of args) {
    if (typeof arg !== "string") throw new Error("All Wrangler args must be strings.");
    if (arg.includes("\n") || arg.includes("\r") || arg.includes("\0")) {
      throw new Error("Wrangler args may not contain control characters.");
    }
  }

  if (command === "tail") {
    throw new Error("wrangler tail is intentionally disabled for MCP automation; use an interactive operator session.");
  }

  return args;
}

function runProcess(command, args, options) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      shell: false,
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (exitCode) => {
      resolve({ exitCode, stdout, stderr });
    });
  });
}

function redact(value) {
  const { token } = config();
  if (!token) return value;
  return value.split(token).join("[redacted]");
}

const server = new McpServer({
  name: "ppc-cloudflare",
  version: "0.1.0",
});

server.registerTool(
  "cloudflare_verify_token",
  {
    title: "Verify Cloudflare token",
    description: "Verify the configured Cloudflare API token and return non-secret metadata.",
  },
  async () => {
    try {
      const data = await cloudflareRequest("/user/tokens/verify");
      return text({
        success: data.success,
        verification_method: "token_verify_endpoint",
        result: data.result
          ? {
              id: data.result.id,
              status: data.result.status,
            }
          : null,
        errors: data.errors,
        messages: data.messages,
      });
    } catch (err) {
      // Some account-scoped tokens work for Wrangler/account APIs but are not
      // accepted by /user/tokens/verify. Treat account listing as fallback proof.
      const accounts = await cloudflareRequest("/accounts");
      return text({
        success: true,
        verification_method: "accounts_api_fallback",
        note: "Token verify endpoint failed, but account API access succeeded.",
        accounts: (accounts.result || []).map((account) => ({
          id: account.id,
          name: account.name,
          type: account.type,
        })),
        verify_error: err.message,
      });
    }
  },
);

server.registerTool(
  "cloudflare_list_accounts",
  {
    title: "List Cloudflare accounts",
    description: "List accounts visible to the configured Cloudflare API token.",
  },
  async () => {
    const data = await cloudflareRequest("/accounts");
    return text((data.result || []).map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
    })));
  },
);

server.registerTool(
  "cloudflare_list_workers",
  {
    title: "List Cloudflare Workers",
    description: "List Workers scripts in an account.",
    inputSchema: {
      account_id: z.string().optional(),
    },
  },
  async ({ account_id }) => {
    const accountId = requireAccountId(account_id);
    const data = await cloudflareRequest(`/accounts/${accountId}/workers/scripts`);
    return text((data.result || []).map((script) => ({
      id: script.id,
      created_on: script.created_on,
      modified_on: script.modified_on,
      usage_model: script.usage_model,
    })));
  },
);

server.registerTool(
  "cloudflare_get_worker",
  {
    title: "Get Cloudflare Worker metadata",
    description: "Fetch metadata for a Worker script in an account.",
    inputSchema: {
      script_name: z.string(),
      account_id: z.string().optional(),
    },
  },
  async ({ script_name, account_id }) => {
    const accountId = requireAccountId(account_id);
    const data = await cloudflareRequest(
      `/accounts/${accountId}/workers/scripts/${encodeURIComponent(script_name)}/settings`,
    );
    return text(data.result || data);
  },
);

server.registerTool(
  "cloudflare_wrangler",
  {
    title: "Run guarded Wrangler command",
    description:
      "Run a restricted Wrangler command in an allowed repo path using CLOUDFLARE_API_TOKEN/CLOUDFLARE_ACCOUNT_ID from the MCP environment.",
    inputSchema: {
      cwd: z.string(),
      args: z.array(z.string()).min(1),
      timeout_ms: z.number().int().min(1000).max(180000).default(120000),
    },
  },
  async ({ cwd, args, timeout_ms }) => {
    requireToken();
    const safeCwd = assertSafeWorkdir(cwd);
    const safeArgs = assertWranglerArgs(args);
    const { token, accountId } = config();
    const env = {
      ...process.env,
      CLOUDFLARE_API_TOKEN: token,
      CF_API_TOKEN: token,
      ...(accountId ? { CLOUDFLARE_ACCOUNT_ID: accountId, CF_ACCOUNT_ID: accountId } : {}),
    };

    const command = "npx";
    const commandArgs = ["wrangler", ...safeArgs];
    const timer = AbortSignal.timeout(timeout_ms);

    const result = await Promise.race([
      runProcess(command, commandArgs, { cwd: safeCwd, env }),
      new Promise((resolve) => timer.addEventListener("abort", () => resolve({
        exitCode: 124,
        stdout: "",
        stderr: `Timed out after ${timeout_ms}ms`,
      }))),
    ]);

    return text({
      cwd: safeCwd,
      command: ["npx", "wrangler", ...safeArgs],
      exit_code: result.exitCode,
      stdout: redact(result.stdout).slice(-12000),
      stderr: redact(result.stderr).slice(-12000),
    });
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
