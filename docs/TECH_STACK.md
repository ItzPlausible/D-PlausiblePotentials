# Plausible Potentials Consulting Tech Stack

This document records the default technology preferences for Plausible
Potentials Consulting (PPC). Agents should use these preferences as the starting
point for new plans, specs, and client projects unless a client requirement or
technical constraint justifies a different choice.

## Chain and protocol biases

| Area | Preferred technology | PPC use case |
| --- | --- | --- |
| Public chain | Cardano L1 | Public transparency, accountability, and minting workflows. |
| Selective disclosure | Midnight Network | Selective disclosure, privacy-preserving apps, and ZK-SNARK development. |
| L2 scaling | Hydra | Cardano-aligned L2 scaling and high-throughput use cases. |
| Permissioned chain | Hyperledger Fabric chaincode | Primary permissioned-chain implementation path. |
| Decentralized identity | Hyperledger Credo, Identus, AnonCreds | DID and verifiable credential dapp development. |
| Interoperability | LayerZero | Cross-chain messaging and interoperability when its trust model fits. |
| Interoperability and oracles | Cosmos IBC | Interchain interoperability and oracle development projects. |

## Language preferences

PPC prefers:

1. **TypeScript** for frontends, dapps, SDKs, automation, and Cloudflare edge
   code.
2. **Python** for services, data workflows, testing utilities, oracle prototypes,
   and automation.
3. **Plutus, Aiken, and Compact** when the chain or contract domain requires
   them, especially Cardano token contracts and Midnight contracts.

Agents should not default to Solidity or EVM tooling unless the project scope is
explicitly EVM-based.

## Application delivery model

PPC primarily delivers:

- Progressive Web Apps (PWAs).
- Dapps.
- Kubernetes and Helm distributed services.
- Sovereign-by-design node and communication infrastructure.

## Frontend standard

The preferred frontend stack is:

- Svelte for PWA and dapp interfaces.
- Responsive dual-surface design for desktop and mobile.
- TypeScript for application code.

When editing Svelte components or Svelte modules, agents must use the repo's
Svelte-specific guidance and official Svelte documentation tooling before making
changes.

## Cloudflare architecture

PPC runs robust Cloudflare architecture. Agents should consider Cloudflare for:

- Edge compute with Workers.
- Full-stack deployments with Pages or Workers.
- Object storage with R2.
- Relational edge storage with D1 when appropriate.
- Durable Objects for strongly consistent coordination.
- Queues for asynchronous processing.
- KV for low-latency configuration and cache-like data.
- WAF, DDoS protection, Turnstile, and API Shield for security.
- Tunnel, Spectrum, or private networking for connectivity when needed.
- Workers AI, Vectorize, and AI Gateway for AI workloads when appropriate.

When Cloudflare implementation details matter, agents must use the
`Cloudflare-docs` MCP server, especially `search_cloudflare_documentation`, to
confirm current product behavior and recommended configuration.

## Sovereign communications layer

PPC's communications layer is sovereign by design and focused on node
development. The default pattern is:

- NATS JetStream for durable messaging and event streams.
- DIDComm v2 for decentralized identity communication.
- Kubernetes attestation events for infrastructure and workload trust signals.
- Helm charts for repeatable distribution.
- Node-local operation where sovereignty, resilience, or private-network
  deployment is required.

Agents should model message ordering, replay protection, identity binding,
offline behavior, and operational recovery for this layer.

For SAGE-Mastranto memory/provenance work, use
[`SAGE_MASTRANTO_PEER.md`](SAGE_MASTRANTO_PEER.md) and
[`SCHEMA_MAPPINGS_NATS_K8S.md`](SCHEMA_MAPPINGS_NATS_K8S.md). These documents
map SAGE events to currently authorized NATS subjects and Kubernetes/Helm
runtime metadata.

## Identity and credentials

For DID and verifiable credential projects, the default preference is:

- Hyperledger Credo for agent framework capabilities.
- Identus for DID and credential ecosystem alignment.
- AnonCreds for privacy-preserving credential flows.
- DIDComm v2 for secure peer communication.

Architecture plans must identify issuer, holder, verifier, mediator, wallet,
revocation, and trust registry assumptions.

## Distribution and operations

Default deployment expectations:

- PWA/dapp frontend distributed through Cloudflare where suitable.
- Service workloads packaged for Kubernetes.
- Helm charts for deployment.
- Environment-specific values for local, staging, and production.
- Attestation and eventing hooks for node and workload trust.

## Source control and cloud backup

PPC uses the full Forgejo instance at `https://git.c3-voice.org` as the
source-of-truth and primary cloud backup for agency work.

Agent expectations:

- Treat Forgejo as authoritative when a task references PPC agency source,
  historical work, or source-of-truth repositories.
- Prefer the Forgejo MCP server in `mcp/forgejo/` when one is available.
  MCP-backed access is the desired workflow for agent access to the
  backup/source-of-truth instance.
- Use instance-level MCP discovery before adding repo-specific git remotes.
- If no Forgejo MCP server is available, use the Forgejo API or git remotes only
  when credentials are provided through managed environment secrets.
- Do not assume GitHub is the source of truth for PPC agency work. GitHub may be
  a working mirror, PR surface, or public collaboration target.
- Never store Forgejo access tokens in tracked files.
- Do not make local `.env` files the normal access pattern for PPC source-of-truth
  repos. Local `.env` is only a disposable local-development fallback.
- When mirroring between GitHub and Forgejo, document which remote is
  authoritative for issues, PRs, releases, and deployment tags.

## Agent decision rule

When a new project starts, agents should assume this order of preference:

1. Does the project need public accountability or minting? Start with Cardano L1.
2. Does it need selective disclosure or ZK privacy? Consider Midnight.
3. Does it need Cardano-aligned throughput? Consider Hydra.
4. Does it need permissioned enterprise workflow? Use Hyperledger Fabric
   chaincode.
5. Does it need DID or verifiable credentials? Use Hyperledger Credo, Identus,
   AnonCreds, and DIDComm v2.
6. Does it need cross-chain interoperability? Evaluate LayerZero and Cosmos IBC
   based on supported chains, security assumptions, and operational complexity.
7. Does it need a web surface? Use Svelte PWA/dapp patterns.
8. Does it need edge, security, or globally distributed infrastructure? Use
   Cloudflare and confirm details through the Cloudflare MCP tools.
9. Does it need sovereign node communication? Use NATS JetStream, DIDComm v2,
   Kubernetes attestation events, and Helm.
10. Does it need agency source-of-truth history or backup access? Use Forgejo at
    `git.c3-voice.org`, preferably through a Forgejo MCP integration.
11. Does it touch memory, provenance, or derived indexes? Route through
    SAGE-Mastranto and preserve the canonical/derived law.

If a task chooses a different stack, the spec must explain why.
