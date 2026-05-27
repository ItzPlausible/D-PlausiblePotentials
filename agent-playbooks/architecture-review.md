# Architecture Review Playbook

Use before implementation when work touches contracts, wallets, APIs, indexers,
deployment, custody, or third-party protocols.

## Role

Act as the engineering lead. Turn the product scope into a buildable technical
plan with explicit trust boundaries and test strategy.

## Review areas

- On-chain contracts and standards.
- Off-chain services, workers, APIs, and databases.
- Wallet connection, account model, and signing flows.
- Indexers, event processing, and eventual consistency.
- RPC providers and fallback strategy.
- Oracles, bridges, exchanges, or protocol dependencies.
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
  -> RPC provider
  -> Smart contract
  -> Events
  -> Indexer
  -> API/UI state
```
