# Agency Operating Model

This document defines how AI agents and humans should move blockchain work from
idea to shipped software.

## Principles

- **Spec before code.** Vague requests become explicit scope before
  implementation.
- **Security is product quality.** Smart-contract bugs, confusing wallet UX, and
  weak key management are product failures.
- **Small verifiable slices.** Prefer testnet or local-fork proof over broad,
  unverified implementation.
- **Docs are part of delivery.** If future agents cannot understand it, the work
  is not done.
- **Human approval for irreversible actions.** Mainnet deployments, privileged
  role changes, token minting, treasury movement, and production key rotation
  require explicit human approval.

## Engagement stages

### 1. Discovery

Output: `docs/SPEC.md`

Clarify:

- User and buyer.
- Target chains and environments.
- Wallet and custody assumptions.
- Token standards, contract standards, or protocols involved.
- Integrations: RPC providers, indexers, oracles, bridges, identity, payments.
- Success metric and launch constraint.
- Compliance, jurisdiction, or data-handling constraints.

### 2. Technical plan

Output: `docs/ARCHITECTURE.md`

Cover:

- On-chain components.
- Off-chain services.
- Data flow and event flow.
- Trust boundaries.
- Admin roles and governance.
- Upgrade strategy.
- Test strategy.
- Deployment plan.

### 3. Build

Output: working code plus tests.

Guidelines:

- Keep each PR focused on one feature or infrastructure change.
- Use established libraries before writing custom primitives.
- For contracts, write unit tests, fuzz/invariant tests where appropriate, and
  fork tests for protocol integrations.
- For apps, test wallet connection, network switching, transaction lifecycle,
  rejected signatures, and reload/reconnect behavior.

### 4. Review

Output: review notes in PR.

Run role-specific review:

- Product review for scope and user value.
- Architecture review for data flow and failure modes.
- Security review for funds, permissions, signatures, and deploy scripts.
- QA review for user flows and release readiness.

### 5. Release

Output: `docs/RELEASES.md` entry and deployment evidence.

Include:

- Version or commit.
- Network and addresses.
- Deployment transaction hashes.
- Verification links.
- Admin role assignments.
- Rollback or pause plan.
- Tests and security checks run.

## Definition of done

A task is done when:

- Acceptance criteria are met.
- Tests pass.
- Relevant docs are updated.
- Security-sensitive changes have review notes.
- Deploy or migration steps are documented.
- Follow-up risks are tracked instead of hidden.

## Agent handoff format

When an agent stops mid-task, leave a short handoff:

```markdown
## Handoff

- Goal:
- Current state:
- Files changed:
- Tests run:
- Known failures:
- Next step:
- Security notes:
```

## Escalation triggers

Pause and ask a human before:

- Mainnet deployment.
- Production private key or signer use.
- Treasury, mint, burn, pause, upgrade, or ownership transactions.
- Changing protocol economics.
- Accepting unaudited cryptography.
- Storing personal data or regulated financial data.
- Bypassing security tooling or failing tests.
