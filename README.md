# D-PlausiblePotentials

Blockchain development agency workspace for AI-agent-augmented delivery.

This repository is intentionally set up as an operating system for client work:
clear project intake, explicit technical planning, chain security gates,
repeatable QA, and release discipline. It borrows the useful idea from
[gstack](https://github.com/garrytan/gstack) that AI coding works best when the
agent is treated like a team of specialists instead of a generic autocomplete.

## What this repo is for

- Client discovery, scoping, architecture, and delivery playbooks.
- PPC-specific blockchain application templates and environment guidance.
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
4. Review [`docs/TECH_STACK.md`](docs/TECH_STACK.md) for PPC's default chain,
   identity, PWA, Cloudflare, and sovereign communications preferences.
5. For a new client project, start from
   [`templates/client-project/README.md`](templates/client-project/README.md).
6. Run the repository checks:

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
5. **Security review** - run chain, identity, messaging, and application security checks
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
│   ├── C3_PWA_ONBOARDING_FLOW.md     # Global PWA entry and surface routing intent
│   ├── ENVIRONMENT.md                # Local and cloud development setup
│   ├── OPERATING_MODEL.md            # Agency delivery process
│   ├── PREFLIGHT_COMMAND_C3_PWA.md   # command.C3 desktop PWA production pre-flight
│   ├── SAGE_MASTRANTO_PEER.md        # SAGE memory/provenance peer design
│   ├── SCHEMA_MAPPINGS_NATS_K8S.md   # NATS and Kubernetes schema mappings
│   ├── SECURITY.md                   # Blockchain security baseline
│   └── TECH_STACK.md                 # PPC technology preferences
├── agent-playbooks/                  # Reusable prompts/checklists for agent sessions
├── mcp/forgejo/                      # Forgejo MCP server for the git.c3-voice.org instance
├── templates/client-project/         # Starting point for client projects
├── scripts/check-repo.mjs            # No-dependency repo hygiene checks
└── .cursor/rules/                    # Cursor-specific agent guidance
```

## Current stack bias

This setup is PPC-first:

- Cardano L1 for public transparency, accountability, and minting.
- Midnight Network for selective disclosure and ZK-SNARK development.
- Hydra for Cardano-aligned L2 scaling.
- Hyperledger Fabric chaincode for permissioned-chain projects.
- Hyperledger Credo, Identus, AnonCreds, and DIDComm v2 for DID and verifiable
  credential dapps.
- LayerZero and Cosmos IBC for interoperability and oracle projects.
- TypeScript and Python as primary development languages, with Plutus, Aiken,
  and Compact when the chain or contract domain calls for them.
- Svelte PWAs/dapps for dual desktop and mobile surfaces.
- Cloudflare architecture, Kubernetes, Helm, NATS JetStream, DIDComm v2, and
  Kubernetes attestation events for sovereign node-oriented deployments.
