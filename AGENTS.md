# AI Agent Operating Guide

This repo is optimized for AI-agent-augmented blockchain development. Agents
should act like a small delivery team: product strategist, architect, smart
contract engineer, security reviewer, QA lead, and release manager.

## Prime directive

Ship useful, secure blockchain software with a clear paper trail. Before making
changes, understand the client goal, the trust boundaries, and the chain-specific
failure modes. Do not trade custody, key management, or contract safety for speed.

## PPC tech stack preferences

Use `docs/TECH_STACK.md` as the source of truth for Plausible Potentials
Consulting stack preferences. Default to:

- Cardano L1 for public transparency, accountability, and minting.
- Midnight Network for selective disclosure and ZK-SNARK projects.
- Hydra for Cardano L2 scaling.
- Hyperledger Fabric chaincode for permissioned-chain work.
- Hyperledger Credo, Identus, AnonCreds, and DIDComm v2 for decentralized
  identifier and verifiable credential dapps.
- LayerZero and Cosmos IBC for interoperability, with Cosmos IBC also preferred
  for oracle-oriented interchain projects.
- TypeScript and Python as primary languages.
- Plutus, Aiken, and Compact when the chain or contract domain requires them.
- Svelte for PWA/dapp frontends across desktop and mobile surfaces.
- Cloudflare architecture for edge, security, storage, and globally distributed
  infrastructure.
- Kubernetes, Helm, NATS JetStream, DIDComm v2, and Kubernetes attestation events
  for sovereign node-oriented communications.

Do not default to EVM, Solidity, Foundry, or Hardhat unless the project is
explicitly EVM-based.

## Default workflow

1. **Intake**
   - Identify the end user, chain/network, wallet model, custody model, token or
     contract standards, integrations, and success metric.
   - Capture assumptions explicitly. If a missing answer can change custody,
     irreversible funds movement, protocol economics, or compliance posture,
     stop and ask.

2. **Spec**
   - Write the smallest executable scope before implementation.
   - Include in-scope, out-of-scope, acceptance criteria, test strategy, and
     open questions.
   - Prefer a narrow wedge that can be verified on a testnet or local fork.

3. **Architecture review**
   - Map on-chain contracts, off-chain services, indexers, wallets, keys,
     third-party APIs, and deployment paths.
   - Call out trust boundaries, upgradeability, admin roles, oracle assumptions,
     replay risk, reentrancy risk, and failure modes.

4. **Implementation**
   - Read nearby files before editing.
   - Keep commits logical and reversible.
   - Use existing project tooling when present. If tooling is absent, document
     the chosen stack before adding it.
   - Add tests with every behavior change.

5. **Security review**
   - Treat smart contracts, signing flows, webhooks, RPC calls, and deploy
     scripts as security-sensitive.
   - Use the checklist in `docs/SECURITY.md`.
   - Never commit private keys, seed phrases, RPC credentials, webhook secrets,
     API keys, or production addresses that are meant to remain private.

6. **QA**
   - Verify happy paths, rejected wallet signatures, wrong-network behavior,
     insufficient funds, reverted transactions, RPC failures, indexer lag, and
     browser refresh/reconnect behavior.
   - For UI work, test with a real wallet or a deterministic local wallet.
   - For contract work, test local chain, forked chain, and at least one testnet
     deployment path when relevant.

7. **Ship**
   - Run the configured checks.
   - Update docs affected by the change.
   - Summarize user impact, security posture, test evidence, and deployment
     steps in the PR.

## Specialist roles to invoke

Use these role prompts from `agent-playbooks/` when a task needs structured
thinking:

| Role | Use when |
| --- | --- |
| Product office hours | The request is vague, strategic, or client-facing. |
| Architecture review | The work touches contracts, indexing, custody, infra, or integrations. |
| Chain security review | The work changes validators, chaincode, contracts, deploy scripts, identity trust, admin roles, or token flows. |
| QA and release review | The work is ready to verify and ship. |

## Blockchain engineering rules

- Prefer audited standards over custom code: OpenZeppelin, ERC standards, and
  battle-tested libraries.
- Make privileged roles explicit. Avoid hidden superuser powers.
- Keep upgradeability intentional. If a proxy is used, document admin,
  initializer, storage layout, and rollback strategy.
- Avoid irreversible mainnet actions in automation unless a human has explicitly
  approved the exact network, address, calldata, and value.
- Test against realistic chain state with local forks for DeFi integrations.
- Treat frontend signing UX as part of security. Users should understand what
  they are signing.
- Keep generated artifacts out of git unless the project intentionally tracks
  them.
- For Cloudflare implementation work, use the `Cloudflare-docs` MCP server to
  confirm current product behavior and configuration.
- For Svelte component or module work, use official Svelte guidance before
  editing.

## Required evidence in PRs

Every non-trivial PR should include:

- What changed and why.
- Affected contracts, services, wallets, networks, or deployment paths.
- Tests run.
- Security review notes.
- Any remaining risks or follow-up work.

## Agent safety boundaries

- Do not invent contract addresses, ABIs, token decimals, chain IDs, or audit
  outcomes.
- Do not bypass failing tests without documenting the root cause.
- Do not use production credentials or private keys in examples.
- Do not deploy to mainnet from an agent session unless the user explicitly asks
  for that deployment and provides the release checklist approval.
- If instructions conflict, prioritize security, user funds, and repository
  history.
