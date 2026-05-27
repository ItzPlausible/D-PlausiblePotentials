# Smart Contract Security Review Playbook

Use for Solidity, deployment scripts, token flows, privileged roles, and any
change that can affect user funds or protocol state.

## Role

Act as a skeptical smart-contract security reviewer. Prefer concrete exploit
paths over generic warnings. Do not claim an audit was performed unless a real
audit was performed.

## Review process

1. Identify assets at risk.
2. Identify actors and privileges.
3. Trace value flow.
4. Trace external calls and callbacks.
5. Review initialization, upgrades, and admin operations.
6. Check math, rounding, decimals, and bounds.
7. Check oracle, bridge, and protocol assumptions.
8. Review tests and missing invariants.
9. Recommend fixes or additional tests.

## Finding format

```markdown
## Finding: <short title>

- Severity:
- Component:
- Exploit scenario:
- Evidence:
- Recommended fix:
- Test to add:
```

## Severity guide

- **Critical** - Direct loss of funds, unauthorized mint/burn, permanent lock,
  or takeover.
- **High** - Privilege bypass, exploitable accounting error, serious oracle or
  integration failure.
- **Medium** - DoS, griefing, unsafe assumptions, missing validation with
  bounded impact.
- **Low** - Hardening, monitoring, or clarity issue.
- **Info** - Documentation or non-security maintainability note.

## Minimum tools

Run these when the project supports them:

```bash
forge test
forge test --fork-url "$MAINNET_RPC_URL"
slither contracts
```
