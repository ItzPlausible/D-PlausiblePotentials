# D-PlausiblePotentials

Blockchain development agency workspace for AI-agent-augmented delivery.

This repository is intentionally set up as an operating system for client work:
clear project intake, explicit technical planning, smart-contract security gates,
repeatable QA, and release discipline. It borrows the useful idea from
[gstack](https://github.com/garrytan/gstack) that AI coding works best when the
agent is treated like a team of specialists instead of a generic autocomplete.

## What this repo is for

- Client discovery, scoping, architecture, and delivery playbooks.
- EVM-first blockchain application templates and environment guidance.
- AI agent instructions for Cursor and other coding agents.
- Security-first review checklists for smart contracts, wallets, APIs, and ops.
- Lightweight repo checks that keep docs and configuration from drifting.

## Quick start

1. Read [`docs/AI_AGENT_OPERATING_GUIDE.md`](docs/AI_AGENT_OPERATING_GUIDE.md)
   for a review-friendly version of the agent workflow and ground rules.
2. Copy `.env.example` to `.env` and fill only the keys needed for your current
   project.
3. Review [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) and install the local
   toolchain you need.
4. For a new client project, start from
   [`templates/client-project/README.md`](templates/client-project/README.md).
5. Run the repository checks:

   ```bash
   npm run check
   ```

## Default delivery workflow

1. **Intake** - clarify the user, chain, wallet, custody, data, and business
   constraints.
2. **Spec** - write the smallest executable scope with assumptions and open
   questions called out.
3. **Architecture review** - model contracts, off-chain services, trust
   boundaries, integrations, and failure paths.
4. **Build** - keep changes small, tested, and scoped to the approved plan.
5. **Security review** - run smart-contract and application security checks
   before release.
6. **QA** - verify user flows, wallet flows, chain interactions, error states,
   and deployment configuration.
7. **Ship** - update docs, produce a release note, and keep deploy keys and
   private keys out of the repo.

## Repository map

```text
.
├── AGENTS.md                         # AI-agent operating rules and specialist roles
├── docs/
│   ├── AI_AGENT_OPERATING_GUIDE.md   # Human-readable agent workflow guide
│   ├── ENVIRONMENT.md                # Local and cloud development setup
│   ├── OPERATING_MODEL.md            # Agency delivery process
│   └── SECURITY.md                   # Blockchain security baseline
├── agent-playbooks/                  # Reusable prompts/checklists for agent sessions
├── templates/client-project/         # Starting point for client projects
├── scripts/check-repo.mjs            # No-dependency repo hygiene checks
└── .cursor/rules/                    # Cursor-specific agent guidance
```

## Current stack bias

This setup is EVM-first because it covers the broadest agency surface area:
Solidity, Foundry, Hardhat, TypeScript, OpenZeppelin, wallets, subgraphs/indexers,
and standard deployment pipelines. Add Solana, Move, Cosmos, or Bitcoin-specific
templates as client demand justifies them.
