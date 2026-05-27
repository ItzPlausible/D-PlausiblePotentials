import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

const requiredPaths = [
  "README.md",
  "AGENTS.md",
  "docs/ENVIRONMENT.md",
  "docs/OPERATING_MODEL.md",
  "docs/SAGE_MASTRANTO_PEER.md",
  "docs/SCHEMA_MAPPINGS_NATS_K8S.md",
  "docs/SECURITY.md",
  "docs/TECH_STACK.md",
  "agent-playbooks/README.md",
  "mcp/forgejo/server.mjs",
  "mcp/forgejo/README.md",
  "mcp/forgejo/cursor-mcp.example.json",
  "templates/client-project/README.md",
  ".env.example",
  ".gitignore",
];

const ignoredDirs = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "out",
  "cache",
  "coverage",
]);

const errors = [];

function fail(message) {
  errors.push(message);
}

function relative(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

for (const requiredPath of requiredPaths) {
  if (!existsSync(path.join(root, requiredPath))) {
    fail(`Missing required path: ${requiredPath}`);
  }
}

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        files.push(...walk(path.join(dir, entry.name)));
      }
      continue;
    }

    if (entry.isFile()) {
      files.push(path.join(dir, entry.name));
    }
  }

  return files;
}

const files = walk(root);
const markdownFiles = files.filter((file) => file.endsWith(".md"));

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const rel = relative(file);

  if (!text.endsWith("\n")) {
    fail(`${rel}: missing final newline`);
  }

  if (/\r\n?/.test(text)) {
    fail(`${rel}: uses CRLF line endings`);
  }
}

for (const file of markdownFiles) {
  const text = readFileSync(file, "utf8");
  const dir = path.dirname(file);
  const rel = relative(file);
  const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const match of text.matchAll(linkPattern)) {
    const rawTarget = match[1].trim();
    if (
      rawTarget.startsWith("http://") ||
      rawTarget.startsWith("https://") ||
      rawTarget.startsWith("mailto:") ||
      rawTarget.startsWith("#")
    ) {
      continue;
    }

    const targetWithoutAnchor = rawTarget.split("#")[0];
    if (!targetWithoutAnchor) {
      continue;
    }

    const targetPath = path.resolve(dir, decodeURIComponent(targetWithoutAnchor));
    if (!existsSync(targetPath)) {
      fail(`${rel}: broken local link -> ${rawTarget}`);
    }
  }
}

const envExamplePath = path.join(root, ".env.example");
if (existsSync(envExamplePath)) {
  const envLines = readFileSync(envExamplePath, "utf8").split("\n");
  for (const [index, line] of envLines.entries()) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const [name, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=");
    if (!name || !/^[A-Z0-9_]+$/.test(name)) {
      fail(`.env.example:${index + 1}: invalid env var name`);
    }

    if (value && !value.startsWith("<") && !value.endsWith("_HERE")) {
      fail(`.env.example:${index + 1}: example env vars should not contain real values`);
    }
  }
}

for (const file of files) {
  const rel = relative(file);
  if (rel.startsWith(".git/")) {
    continue;
  }

  if (statSync(file).size > 1024 * 1024) {
    fail(`${rel}: file is larger than 1 MiB; confirm it belongs in git`);
  }
}

if (errors.length > 0) {
  console.error("Repository check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Repository check passed (${files.length} files checked).`);
