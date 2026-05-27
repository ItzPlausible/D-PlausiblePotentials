# Architecture

## System overview

## Components

| Component | Responsibility | Notes |
| --- | --- | --- |
| Contracts | | |
| Frontend | | |
| Backend/API | | |
| Indexer | | |
| Identity / credentials | | |
| Messaging | | |
| Cloudflare edge | | |
| Kubernetes / Helm | | |
| Infrastructure | | |

## Data flow

```text
User wallet
  -> Svelte PWA/dapp
  -> Chain / DID / credential network
  -> Events / credentials / messages
  -> NATS JetStream / indexer / API
  -> Cloudflare edge or Kubernetes service
  -> UI state
```

## Trust boundaries

## Contracts

## DID and verifiable credentials

## Interoperability and oracles

## Sovereign communications

## Cloudflare architecture

## Off-chain services

## Integrations

## Admin roles

## Upgradeability

## Failure modes

## Test strategy

## Deployment plan

## Agent notes

Use `agent-playbooks/architecture-review.md` before implementation.
