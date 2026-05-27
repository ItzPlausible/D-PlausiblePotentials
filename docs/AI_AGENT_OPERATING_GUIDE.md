# AI Agent Operating Guide

This guide explains how AI coding agents should work inside
D-PlausiblePotentials. It is written for human review and mirrors the operating
rules in [`../AGENTS.md`](../AGENTS.md).

## Purpose

The repo is designed for AI-agent-augmented blockchain development. Agents
should behave like a small delivery team with clear roles:

- Product strategist
- Blockchain architect
- Smart-contract engineer
- Security reviewer
- QA lead
- Release manager

The goal is to ship useful blockchain software without weakening safety,
custody, key management, or review discipline.

## Prime directive

Ship useful, secure blockchain software with a clear paper trail.

Before changing code, an agent should understand:

- The client goal.
- The target users.
- The target chain or network.
- The custody model.
- The trust boundaries.
- The chain-specific failure modes.

Speed should never come at the expense of user funds, private keys, contract
safety, or repository history.

## PPC tech stack preferences

Agents should use [`TECH_STACK.md`](TECH_STACK.md) as the source of truth for
Plausible Potentials Consulting technology preferences.

Default biases:

- **Cardano L1** for public-chain transparency, accountability, and minting.
- **Midnight Network** for selective disclosure, privacy, and ZK-SNARK projects.
- **Hydra** for Cardano-aligned L2 scaling.
- **Hyperledger Fabric chaincode** for permissioned-chain systems.
- **Hyperledger Credo, Identus, AnonCreds, and DIDComm v2** for decentralized
  identifier and verifiable credential dapps.
- **LayerZero** for interoperability when its trust model fits the project.
- **Cosmos IBC** for interoperability and oracle development projects.
- **TypeScript and Python** as primary development languages.
- **Plutus, Aiken, and Compact** when the chain or contract domain requires
  them.
- **Svelte** for PWA and dapp frontends across desktop and mobile surfaces.
- **Cloudflare** for edge, security, storage, and distributed infrastructure.
- **Kubernetes, Helm, NATS JetStream, DIDComm v2, and Kubernetes attestation
  events** for sovereign node-oriented communications.
- **Forgejo at `https://git.c3-voice.org`** as the source-of-truth and primary
  cloud backup for PPC agency work.

Agents should not default to EVM, Solidity, Foundry, or Hardhat unless the
client or project scope is explicitly EVM-based.

## Default workflow

### 1. Intake

The agent identifies:

- End user.
- Chain or network.
- Wallet model.
- Custody model.
- Token or contract standards.
- Integrations.
- Success metric.

If a missing answer can affect custody, irreversible funds movement, protocol
economics, or compliance posture, the agent should stop and ask.

### 2. Spec

The agent writes or updates a narrow executable scope before implementation.

The spec should include:

- In-scope work.
- Out-of-scope work.
- Acceptance criteria.
- Test strategy.
- Open questions.

Prefer the smallest useful release that can be verified on a local fork,
testnet, or controlled staging environment.

### 3. Architecture review

Before building, the agent maps:

- On-chain contracts.
- Off-chain services.
- Indexers.
- Wallets.
- Keys and signers.
- Third-party APIs.
- Deployment paths.

The review should call out:

- Trust boundaries.
- Upgradeability.
- Admin roles.
- Oracle assumptions.
- Replay risk.
- Reentrancy risk.
- Failure modes.

### 4. Implementation

During implementation, the agent should:

- Read nearby files before editing.
- Keep changes scoped to the approved plan.
- Use existing project tooling when present.
- Document any newly chosen stack or tool.
- Add tests with behavior changes.
- Keep commits logical and reversible.

### 5. Security review

The agent treats these as security-sensitive:

- Smart contracts.
- Signing flows.
- Webhooks.
- RPC calls.
- Deployment scripts.
- Admin operations.
- Token flows.

The agent should use [`SECURITY.md`](SECURITY.md) and the
[`smart-contract-security-review`](../agent-playbooks/smart-contract-security-review.md)
playbook before shipping security-sensitive work.

### 6. QA

The agent verifies:

- Happy paths.
- Rejected wallet signatures.
- Wrong-network behavior.
- Insufficient funds.
- Reverted transactions.
- RPC failures.
- Indexer lag.
- Browser refresh and reconnect behavior.

For UI work, test with a real wallet or deterministic local wallet. For contract
work, test local chain behavior, forked chain behavior, and testnet deployment
paths when relevant.

### 7. Ship

Before shipping, the agent should:

- Run configured checks.
- Update affected docs.
- Summarize user impact.
- Summarize security posture.
- Provide test evidence.
- Document deployment steps and remaining risks.

## Specialist role playbooks

Use the playbooks in [`../agent-playbooks/`](../agent-playbooks/) when a task
needs structured thinking.

| Role | Playbook | Use when |
| --- | --- | --- |
| Product office hours | [`product-office-hours.md`](../agent-playbooks/product-office-hours.md) | The request is vague, strategic, or client-facing. |
| Architecture review | [`architecture-review.md`](../agent-playbooks/architecture-review.md) | The work touches contracts, indexing, custody, infrastructure, or integrations. |
| Chain security review | [`smart-contract-security-review.md`](../agent-playbooks/smart-contract-security-review.md) | The work changes validators, chaincode, contracts, deploy scripts, identity trust, admin roles, or token flows. |
| QA and release review | [`qa-release-review.md`](../agent-playbooks/qa-release-review.md) | The work is ready to verify and ship. |

## Blockchain engineering rules

- Prefer audited standards over custom code.
- Use OpenZeppelin, ERC standards, and battle-tested libraries when appropriate.
- Make privileged roles explicit.
- Avoid hidden superuser powers.
- Keep upgradeability intentional.
- If a proxy is used, document the admin, initializer, storage layout, and
  rollback strategy.
- Avoid irreversible mainnet actions in automation unless a human explicitly
  approves the exact network, address, calldata, and value.
- Test against realistic chain state for each target ecosystem.
- Treat frontend signing UX as part of security.
- Keep generated artifacts out of git unless the project intentionally tracks
  them.
- Use the `Cloudflare-docs` MCP server before making Cloudflare implementation
  decisions.
- Prefer a Forgejo MCP server for PPC source-of-truth repo access. If no Forgejo
  MCP server is available, use Forgejo's API or git remotes only when credentials
  are provided through managed environment secrets. Local `.env` files are not
  the normal PPC source-of-truth access pattern.
- Use official Svelte guidance before editing Svelte components or modules.

## Required evidence in PRs

Every non-trivial PR should include:

- What changed and why.
- Affected contracts, services, wallets, networks, or deployment paths.
- Tests run.
- Security review notes.
- Remaining risks or follow-up work.

## Safety boundaries

Agents must not:

- Invent contract addresses.
- Invent ABIs.
- Invent token decimals.
- Invent chain IDs.
- Invent audit outcomes.
- Bypass failing tests without documenting the root cause.
- Use production credentials or private keys in examples.
- Deploy to mainnet unless the user explicitly asks for that deployment and
  approves the release checklist.

If instructions conflict, prioritize security, user funds, and repository
history.

## Human approval required

Human approval is required before:

- Mainnet deployment.
- Contract upgrades.
- Ownership transfers.
- Treasury movement.
- Token minting, burning, or pausing.
- Multisig transaction submission.
- Production secret rotation.

## Review questions for you

When reviewing this guide, consider:

1. Do these agent boundaries match how you want the agency to operate?
2. Which PPC-preferred chains or protocols should get project templates first?
3. Should mainnet deployment be completely forbidden to agents, or allowed with
   explicit checklist approval?
4. Which Cloudflare services are mandatory for the first production reference
   architecture?
5. Should client work live inside this repo, or should this repo remain a
   reusable operating template for separate client repos?
