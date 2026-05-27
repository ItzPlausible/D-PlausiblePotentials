# Blockchain Security Baseline

Use this as the minimum bar for blockchain work. Expand it for each client and
protocol.

## Secret handling

- Never commit private keys, mnemonics, seed phrases, RPC secrets, API keys,
  webhook secrets, or deployer credentials.
- Use throwaway keys for local development and testnets.
- Use hardware wallets, multisigs, or managed signers for production operations.
- Keep `.env` out of git. Commit only `.env.example`.
- Redact secrets from logs, screenshots, PR comments, and agent transcripts.
- Rotate any secret that may have been exposed.

## Chain and contract checklist

Review every Cardano, Midnight, Fabric, Cosmos, EVM, or other chain change for:

- Asset ownership, custody, minting, burning, locking, and release paths.
- Validator, chaincode, contract, or script authorization.
- DID, credential, issuer, holder, verifier, mediator, and revocation trust.
- Selective disclosure and zero-knowledge proof assumptions.
- Interoperability bridge, IBC, and message verification assumptions.
- Reentrancy and checks-effects-interactions order.
- Access control and role assignment.
- Upgradeability, initializers, storage layout, and proxy admin safety.
- Arithmetic precision, rounding, decimals, and fee math.
- Oracle manipulation, stale prices, and sequencer downtime.
- Front-running, sandwiching, replay, and signature malleability.
- Denial of service through unbounded loops or griefing.
- External call assumptions and callback behavior.
- Token compatibility issues: fee-on-transfer, rebasing, missing return values,
  non-standard decimals, ERC777 hooks.
- Pause, emergency withdrawal, and recovery paths.
- Event coverage for monitoring and accounting.
- Invariant and fuzz coverage for critical value flows.

## Application checklist

Review frontend and backend changes for:

- Clear signing prompts and transaction previews.
- Wrong-chain and unsupported-chain handling.
- Rejected signature and reverted transaction states.
- RPC failover and rate limits.
- Indexer lag and eventual consistency.
- DIDComm v2 message authenticity, replay protection, and routing.
- NATS JetStream stream retention, consumer durability, and replay behavior.
- Kubernetes attestation event integrity and trust policy.
- Webhook authentication and replay protection.
- Session, auth, and wallet-account binding.
- Input validation for addresses, chain IDs, token IDs, and calldata.
- Error messages that do not leak secrets.

## Deployment checklist

Before any production deployment:

1. Confirm network, chain ID or network identifier, RPC endpoint, deployer, and
   expected addresses or identifiers.
2. Run local tests.
3. Run realistic integration tests for external protocol integrations.
4. Run static analysis or ecosystem-specific security checks.
5. Simulate deployment and post-deploy setup.
6. Verify constructor args, initializer args, genesis/channel config, and
   ownership or admin transfers.
7. Confirm multisig or admin role assignments.
8. Verify source code, chaincode package IDs, policy identifiers, or deployment
   metadata when applicable.
9. Record addresses, policy IDs, package IDs, transaction hashes, or channel IDs
   in release docs.
10. Confirm monitoring, pause controls, and rollback plan.

## Recommended tools

| Tool | Use |
| --- | --- |
| Aiken / Plutus tooling | Cardano validator and script development |
| Midnight Compact tooling | Midnight contract development |
| Hyperledger Fabric test network | Chaincode integration testing |
| Hyperledger Credo / Identus tooling | DID and verifiable credential testing |
| NATS CLI | JetStream stream and consumer validation |
| kubectl / Helm | Kubernetes and Helm deployment validation |
| Cloudflare Wrangler | Workers, Pages, and edge configuration validation |
| Ecosystem static analysis tools | Contract, validator, or chaincode hardening |

## Human approval required

AI agents must not execute these without explicit approval:

- Mainnet deployments.
- Contract, validator, or chaincode upgrades.
- Ownership transfers.
- Treasury movements.
- Token mint, burn, or pause actions.
- Multisig transaction submissions.
- DID issuer, trust registry, or revocation authority changes.
- Production Kubernetes or Cloudflare secret changes.
- Production secret rotation.

## Security notes template

Add this section to PRs or release notes for security-sensitive work:

```markdown
## Security notes

- Assets at risk:
- Privileged roles:
- External dependencies:
- Tests:
- Static analysis:
- Known limitations:
- Human approvals needed:
```
