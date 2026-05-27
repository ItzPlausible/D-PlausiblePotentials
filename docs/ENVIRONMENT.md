# Development Environment

Use this document to bootstrap local machines, Cursor Cloud agents, and client
project workspaces consistently.

## Baseline tools

Install the tools that match the project you are working on. The default agency
stack is EVM-first.

| Area | Recommended tool | Purpose |
| --- | --- | --- |
| Git | Git + GitHub CLI | Source control and PR inspection |
| JavaScript | Node.js LTS + pnpm | Frontends, scripts, SDKs, Hardhat |
| Solidity | Foundry | Fast contract tests, fuzzing, local forks |
| Solidity | Hardhat | Plugin-rich deployments and ecosystem integrations |
| Security | Slither | Static analysis for Solidity |
| Security | Mythril or Aderyn | Deeper contract analysis when needed |
| Local chain | Anvil | Deterministic local EVM |
| Wallet QA | MetaMask or Rabby | Browser signing flows |
| Containers | Docker | Reproducible services and infra dependencies |

## Suggested installs

```bash
# Node package manager
corepack enable
corepack prepare pnpm@latest --activate

# Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Solidity static analysis
python3 -m pip install --user slither-analyzer
```

## Environment variables

Copy `.env.example` to `.env` and fill only what the current project requires.

Rules:

- Keep `.env` local.
- Never commit seed phrases, private keys, deployer keys, or production API keys.
- Use testnet-only throwaway keys for examples and CI.
- Prefer platform secret stores for CI and deployments.
- Rotate any secret that appears in chat, logs, shell history, screenshots, or a
  public repository.

## Cursor and AI-agent setup

This repo includes tracked Cursor rules in `.cursor/rules/`. Agent sessions
should read `AGENTS.md` before editing and should use the playbooks in
`agent-playbooks/` for structured review.

Recommended agent loop:

1. Ask for or draft a spec.
2. Run the architecture playbook.
3. Implement in small slices.
4. Run the smart-contract security playbook for on-chain changes.
5. Run QA and release review before PR.

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
forge test
forge test --fork-url "$MAINNET_RPC_URL"
slither contracts
```

If a project uses different commands, document them in that project's README and
`docs/SPEC.md`.

## Cloud agent notes

Cursor Cloud agents start from a clean machine. When adding heavyweight
dependencies to a client repo, document the setup steps here or in that client
project's README so future agents do not rediscover them.
