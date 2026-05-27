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

## Smart-contract checklist

Review every contract change for:

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
- Webhook authentication and replay protection.
- Session, auth, and wallet-account binding.
- Input validation for addresses, chain IDs, token IDs, and calldata.
- Error messages that do not leak secrets.

## Deployment checklist

Before any production deployment:

1. Confirm network, chain ID, RPC endpoint, deployer, and expected addresses.
2. Run local tests.
3. Run fork tests for external protocol integrations.
4. Run static analysis on contracts.
5. Simulate deployment and post-deploy setup.
6. Verify constructor args, initializer args, and ownership transfers.
7. Confirm multisig or admin role assignments.
8. Verify source code on the block explorer when applicable.
9. Record addresses and transaction hashes in release docs.
10. Confirm monitoring, pause controls, and rollback plan.

## Recommended tools

| Tool | Use |
| --- | --- |
| Foundry | Unit, fuzz, invariant, fork tests |
| Slither | Solidity static analysis |
| Aderyn | Additional Solidity static analysis |
| Echidna | Property testing for high-risk contracts |
| Tenderly | Simulation, debugging, monitoring |
| OpenZeppelin Defender | Admin operations and monitoring |
| Safe | Multisig treasury and admin control |

## Human approval required

AI agents must not execute these without explicit approval:

- Mainnet deployments.
- Contract upgrades.
- Ownership transfers.
- Treasury movements.
- Token mint, burn, or pause actions.
- Multisig transaction submissions.
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
