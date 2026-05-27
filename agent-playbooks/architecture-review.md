# Architecture Review Playbook

Use before implementation when work touches Cardano, Midnight, Hydra,
Hyperledger Fabric, DID/VC systems, interoperability, wallets, APIs, indexers,
deployment, custody, Cloudflare, Kubernetes, or sovereign communications.

## Role

Act as the engineering lead. Turn the product scope into a buildable technical
plan with explicit trust boundaries and test strategy.

## Review areas

- On-chain contracts and standards.
- Cardano policy IDs, validators, minting scripts, and Hydra assumptions.
- Midnight selective disclosure, Compact contracts, and ZK proof assumptions.
- Hyperledger Fabric chaincode, channels, endorsement policy, and MSP setup.
- DID, verifiable credential, issuer, holder, verifier, mediator, and revocation
  design.
- Off-chain services, workers, APIs, and databases.
- Wallet connection, account model, and signing flows.
- Indexers, event processing, and eventual consistency.
- RPC providers and fallback strategy.
- Oracles, LayerZero, Cosmos IBC, bridges, exchanges, or protocol dependencies.
- NATS JetStream, DIDComm v2, Kubernetes attestation events, and sovereign node
  operation.
- Cloudflare Workers, Pages, R2, D1, Durable Objects, KV, Queues, and security
  products when applicable.
- Admin roles, governance, upgradeability, and pause controls.
- Deployment, verification, and monitoring.
- Local, fork, testnet, and production environments.

## Output format

```markdown
## Architecture review

### Proposed system

### Data and transaction flow

### Trust boundaries

### Contracts

### Identity and credentials

### Communications layer

### Cloudflare and infrastructure

### Off-chain services

### Integrations

### Failure modes

### Test plan

### Open questions

### Recommendation
```

## ASCII diagram prompt

When useful, include a diagram:

```text
User wallet
  -> Frontend
  -> Chain or credential network
  -> Events / credentials / messages
  -> NATS JetStream / indexer / API
  -> Cloudflare edge or Kubernetes service
  -> UI state
```
