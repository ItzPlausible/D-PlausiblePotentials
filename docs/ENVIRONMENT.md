# Development Environment

Use this document to bootstrap local machines, Cursor Cloud agents, and client
project workspaces consistently.

## Baseline tools

Install the tools that match the project you are working on. The default agency
stack is documented in [`TECH_STACK.md`](TECH_STACK.md).

| Area | Recommended tool | Purpose |
| --- | --- | --- |
| Git | Git, GitHub CLI, Forgejo MCP/API | Source control, PR inspection, and PPC source-of-truth backup access |
| TypeScript | Node.js LTS + pnpm | Svelte PWAs, dapps, SDKs, Cloudflare code, automation |
| Python | Python 3 + uv or pipx | Services, data workflows, oracle prototypes, automation |
| Frontend | Svelte | Dual desktop and mobile PWA/dapp surfaces |
| Cardano | Cardano CLI, Aiken, Plutus tooling | Cardano minting, validators, scripts |
| Privacy | Midnight Compact tooling | Selective disclosure and ZK-oriented contracts |
| Permissioned chain | Hyperledger Fabric tooling | Chaincode and permissioned-network development |
| Identity | Hyperledger Credo, Identus, AnonCreds | DID and verifiable credential dapps |
| Interop | LayerZero tooling, Cosmos SDK/IBC tooling | Cross-chain messaging, IBC, oracle projects |
| Cloudflare | Wrangler | Workers, Pages, R2, D1, KV, Durable Objects, Queues |
| Messaging | NATS CLI | NATS JetStream streams, consumers, and node messaging |
| Containers | Docker | Reproducible services and infra dependencies |
| Orchestration | kubectl + Helm | Kubernetes and Helm distribution |

## Suggested installs

```bash
# Node package manager
corepack enable
corepack prepare pnpm@latest --activate

# Python tooling
python3 -m pip install --user pipx
python3 -m pipx ensurepath

# Cloudflare Workers/Pages tooling
pnpm add -g wrangler

# Kubernetes distribution tooling
# Install kubectl and Helm using your OS package manager or official installers.
```

Project-specific toolchains such as Aiken, Plutus, Midnight Compact,
Hyperledger Fabric, Cosmos SDK, LayerZero, and NATS should be installed when a
client project requires them. Document exact versions in the client project
README.

## Secrets and environment variables

PPC does not rely on local storage as the primary secrets workflow. Use managed
secrets and authenticated integrations first:

1. MCP server authentication for services that support MCP.
2. Cursor or cloud-agent environment secrets.
3. CI/CD secret stores.
4. Kubernetes secrets, sealed secrets, external-secrets, or the client-approved
   secret manager.
5. Local `.env` files only for disposable local development.

`.env.example` is a reference schema for variable names, not the preferred place
to configure agency access.

Rules:

- Never commit seed phrases, private keys, deployer keys, access tokens, or
  production API keys.
- Do not place source-of-truth Forgejo credentials in GitHub-tracked files.
- Use testnet-only throwaway keys for examples and CI.
- Rotate any secret that appears in chat, logs, shell history, screenshots, or a
  public repository.

## Cursor and AI-agent setup

This repo includes tracked Cursor rules in `.cursor/rules/`. Agent sessions
should read `AGENTS.md` before editing and should use the playbooks in
`agent-playbooks/` for structured review.

Recommended agent loop:

1. Ask for or draft a spec.
2. Check [`TECH_STACK.md`](TECH_STACK.md) for PPC defaults.
3. Implement in small slices.
4. Run the architecture playbook.
5. Run the security playbook for on-chain, DID, credential, messaging, or
   deployment changes.
6. Run QA and release review before PR.

## Client project layout

For new client work, create a project folder from `templates/client-project/`.

Recommended top-level shape for a client engagement:

```text
clients/<client-or-project-slug>/
├── README.md
├── docs/
│   ├── SPEC.md
│   ├── ARCHITECTURE.md
│   ├── SECURITY_NOTES.md
│   └── RELEASES.md
├── contracts/
├── apps/
├── packages/
├── charts/
├── scripts/
└── test/
```

Keep client-specific secrets outside the repo or in the client's approved secret
manager.

## Common commands

Commands vary by project, but new projects should converge on these names:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
wrangler deploy --dry-run
helm lint charts/*
kubectl diff -f k8s/
```

If a project uses different commands, document them in that project's README and
`docs/SPEC.md`.

## Cloudflare MCP requirement

When Cloudflare implementation details matter, agents must use the
`Cloudflare-docs` MCP server. Use `search_cloudflare_documentation` for Workers,
Pages, R2, D1, Durable Objects, KV, Queues, WAF, DDoS protection, API Shield,
Turnstile, Tunnel, Spectrum, Workers AI, Vectorize, and related platform
decisions.

For account inspection and deployment automation, use the PPC Cloudflare MCP
server in `mcp/cloudflare/`. It expects managed secrets:

```bash
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

The Cloudflare MCP server exposes guarded Wrangler commands for deploy/check
workflows and does not store Cloudflare tokens in the repo.

## Forgejo source-of-truth requirement

PPC uses the full Forgejo instance at `https://git.c3-voice.org` as the
source-of-truth and primary cloud backup for agency work. Agents should use the
Forgejo MCP server in `mcp/forgejo/` when one is available. This is the preferred
workflow because it avoids local token handling and lets the user control
authentication at the platform level.

If a Forgejo MCP server is not available, agents may use normal git remotes or
the Forgejo API only when credentials are provided through managed environment
secrets. Do not ask the user to commit credentials or rely on GitHub-tracked
files for Forgejo access.

The MCP integration is instance-aware and should be used to discover repositories
across `git.c3-voice.org`. Git remotes remain repo-specific by design and should
only be added after the relevant Forgejo repository is identified.

Expected managed secret names when an MCP integration is not available:

```bash
FORGEJO_URL=https://git.c3-voice.org
FORGEJO_TOKEN=
FORGEJO_OWNER=
```

Local `.env` is a last-resort local development fallback, not PPC's normal
source-of-truth access pattern.

For the Forgejo token named `C3-Cursor`, store the token value as the managed
environment variable `FORGEJO_TOKEN`. The name `C3-Cursor` is the token's display
name in Forgejo; `FORGEJO_TOKEN` is the variable the MCP server reads.

See [`../mcp/forgejo/cursor-mcp.example.json`](../mcp/forgejo/cursor-mcp.example.json)
for a Cursor MCP configuration example.

## Cloud agent notes

Cursor Cloud agents start from a clean machine. When adding heavyweight
dependencies to a client repo, document the setup steps here or in that client
project's README so future agents do not rediscover them.
